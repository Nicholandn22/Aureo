import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { KERNEL_V3_1 } from '@zerodev/sdk/constants';
import { toPermissionValidator } from '@zerodev/permissions';
import { toCallPolicy, toSudoPolicy } from '@zerodev/permissions/policies';
import { createPublicClient, http, type WalletClient, type PublicClient, type Address, encodeFunctionData } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { mantleSepolia, CONTRACTS, AUREO_POOL_ABI, ERC20_ABI, ZERODEV_CONFIG } from '@/config/constants';

/**
 * Session Key Configuration
 */
export interface SessionKeyConfig {
    sessionPrivateKey: `0x${string}`;
    sessionAddress: Address;
    expiresAt: number;
}

/**
 * Creates a Kernel Smart Account for a user
 * @param signer - The user's wallet client (from Privy embedded wallet)
 * @returns The kernel account client and smart account address
 */
export async function createSmartAccount(signer: WalletClient) {
    try {
        const publicClient = createPublicClient({
            transport: http(mantleSepolia.rpcUrls.default.http[0]),
            chain: mantleSepolia,
        });

        // Create ECDSA validator from user's signer
        const ecdsaValidator = await signerToEcdsaValidator(publicClient as PublicClient, {
            signer,
            kernelVersion: KERNEL_V3_1,
        });

        // Create the Kernel Account
        const account = await createKernelAccount(publicClient as PublicClient, {
            plugins: {
                sudo: ecdsaValidator,
            },
            kernelVersion: KERNEL_V3_1,
        });

        // Create Kernel Account Client
        const kernelClient = createKernelAccountClient({
            account,
            chain: mantleSepolia,
            bundlerTransport: http(ZERODEV_CONFIG.bundlerRpc),
            middleware: {
                sponsorUserOperation: async ({ userOperation }) => {
                    const paymasterClient = createZeroDevPaymasterClient({
                        chain: mantleSepolia,
                        transport: http(ZERODEV_CONFIG.paymasterRpc),
                    });
                    return paymasterClient.sponsorUserOperation({
                        userOperation,
                    });
                },
            },
        });

        return {
            kernelClient,
            smartAccountAddress: account.address,
        };
    } catch (error) {
        console.error('Error creating smart account:', error);
        throw new Error('Failed to create smart account');
    }
}

/**
 * Creates a session key with scoped permissions for AI trading
 * Only allows:
 * - approve() on MockUSDC and MockGold
 * - buyGold() on AureoRWAPool
 * - sellGold() on AureoRWAPool
 * 
 * @param signer - The user's wallet client
 * @param smartAccountAddress - The user's smart account address
 * @param durationInSeconds - How long the session key should be valid (default: 7 days)
 * @returns Session key configuration
 */
export async function createSessionKey(
    signer: WalletClient,
    smartAccountAddress: Address,
    durationInSeconds: number = 7 * 24 * 60 * 60 // 7 days
): Promise<SessionKeyConfig> {
    try {
        const publicClient = createPublicClient({
            transport: http(mantleSepolia.rpcUrls.default.http[0]),
            chain: mantleSepolia,
        });

        // Generate a new private key for the session
        const sessionPrivateKey = generatePrivateKey();
        const sessionKeySigner = privateKeyToAccount(sessionPrivateKey);

        // Create ECDSA validator for the main account
        const ecdsaValidator = await signerToEcdsaValidator(publicClient as PublicClient, {
            signer,
            kernelVersion: KERNEL_V3_1,
        });

        // Create the main Kernel Account
        const mainAccount = await createKernelAccount(publicClient as PublicClient, {
            plugins: {
                sudo: ecdsaValidator,
            },
            kernelVersion: KERNEL_V3_1,
            address: smartAccountAddress,
        });

        // Define expiration timestamp
        const expiresAt = Math.floor(Date.now() / 1000) + durationInSeconds;

        // Create session key validator with scoped permissions
        const permissionValidator = await toPermissionValidator(publicClient as PublicClient, {
            signer: sessionKeySigner,
            policies: [
                // Policy 1: Allow approve on MockUSDC
                toCallPolicy({
                    permissions: [
                        {
                            target: CONTRACTS.MOCK_USDC,
                            abi: ERC20_ABI,
                            functionName: 'approve',
                            args: [
                                {
                                    operator: 'EQUAL',
                                    value: CONTRACTS.AUREO_POOL, // Only allow approving the pool
                                },
                                null, // Any amount
                            ],
                        },
                    ],
                }),
                // Policy 2: Allow approve on MockGold
                toCallPolicy({
                    permissions: [
                        {
                            target: CONTRACTS.MOCK_GOLD,
                            abi: ERC20_ABI,
                            functionName: 'approve',
                            args: [
                                {
                                    operator: 'EQUAL',
                                    value: CONTRACTS.AUREO_POOL,
                                },
                                null,
                            ],
                        },
                    ],
                }),
                // Policy 3: Allow buyGold on AureoRWAPool
                toCallPolicy({
                    permissions: [
                        {
                            target: CONTRACTS.AUREO_POOL,
                            abi: AUREO_POOL_ABI,
                            functionName: 'buyGold',
                        },
                    ],
                }),
                // Policy 4: Allow sellGold on AureoRWAPool
                toCallPolicy({
                    permissions: [
                        {
                            target: CONTRACTS.AUREO_POOL,
                            abi: AUREO_POOL_ABI,
                            functionName: 'sellGold',
                        },
                    ],
                }),
            ],
            kernelVersion: KERNEL_V3_1,
        });

        // Enable the session key by installing the permission validator
        const sessionKeyAccount = await createKernelAccount(publicClient as PublicClient, {
            plugins: {
                sudo: ecdsaValidator, // Main account validator
                regular: permissionValidator, // Session key validator
            },
            kernelVersion: KERNEL_V3_1,
            address: smartAccountAddress,
        });

        // Create a client to enable the session key
        const kernelClient = createKernelAccountClient({
            account: sessionKeyAccount,
            chain: mantleSepolia,
            bundlerTransport: http(ZERODEV_CONFIG.bundlerRpc),
            middleware: {
                sponsorUserOperation: async ({ userOperation }) => {
                    const paymasterClient = createZeroDevPaymasterClient({
                        chain: mantleSepolia,
                        transport: http(ZERODEV_CONFIG.paymasterRpc),
                    });
                    return paymasterClient.sponsorUserOperation({
                        userOperation,
                    });
                },
            },
        });

        // Enable the session key (this requires a user signature)
        const enableHash = await kernelClient.sendUserOperation({
            userOperation: {
                callData: await sessionKeyAccount.encodeCallData({
                    to: smartAccountAddress,
                    value: 0n,
                    data: '0x',
                }),
            },
        });

        console.log('Session key enabled. UserOp hash:', enableHash);

        return {
            sessionPrivateKey,
            sessionAddress: sessionKeySigner.address,
            expiresAt,
        };
    } catch (error) {
        console.error('Error creating session key:', error);
        throw new Error('Failed to create session key');
    }
}

/**
 * Get balances for the smart account
 */
export async function getBalances(smartAccountAddress: Address) {
    const publicClient = createPublicClient({
        transport: http(mantleSepolia.rpcUrls.default.http[0]),
        chain: mantleSepolia,
    });

    const [usdcBalance, goldBalance] = await Promise.all([
        publicClient.readContract({
            address: CONTRACTS.MOCK_USDC,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [smartAccountAddress],
        }),
        publicClient.readContract({
            address: CONTRACTS.MOCK_GOLD,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [smartAccountAddress],
        }),
    ]);

    return {
        usdc: usdcBalance,
        gold: goldBalance,
    };
}
