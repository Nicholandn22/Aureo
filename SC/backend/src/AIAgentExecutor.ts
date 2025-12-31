import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { KERNEL_V3_1 } from '@zerodev/sdk/constants';
import { toPermissionValidator } from '@zerodev/permissions';
import { createPublicClient, http, type Address, type PublicClient, encodeFunctionData, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Mantle Sepolia Configuration
 */
const mantleSepolia = defineChain({
    id: 5003,
    name: 'Mantle Sepolia',
    network: 'mantle-sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'MNT',
        symbol: 'MNT',
    },
    rpcUrls: {
        default: {
            http: [process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz'],
        },
        public: {
            http: ['https://rpc.sepolia.mantle.xyz'],
        },
    },
    testnet: true,
});

/**
 * Contract Addresses
 */
const CONTRACTS = {
    AUREO_POOL: (process.env.AUREO_POOL_ADDRESS || '0x475F5c184D23D5839123e7CDB23273eF0470C018') as `0x${string}`,
    MOCK_USDC: (process.env.MOCK_USDC_ADDRESS || '0x53b8e9e6513A2e7A4d23F8F9BFe3F5985C9788e4') as `0x${string}`,
    MOCK_GOLD: (process.env.MOCK_GOLD_ADDRESS || '0x6830999D9173B235dF6ac8c9068c4235fd58f532') as `0x${string}`,
};

/**
 * ABIs
 */
const AUREO_POOL_ABI = [
    {
        type: 'function',
        name: 'buyGold',
        inputs: [{ name: '_usdcAmount', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'sellGold',
        inputs: [{ name: '_goldAmount', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'getGoldPrice18Decimals',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

const ERC20_ABI = [
    {
        type: 'function',
        name: 'approve',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

/**
 * AI Agent Class
 */
export class AIAgent {
    private sessionPrivateKey: `0x${string}`;
    private smartAccountAddress: Address;
    private publicClient: PublicClient;
    private kernelClient: any;

    constructor(sessionPrivateKey: `0x${string}`, smartAccountAddress: Address) {
        this.sessionPrivateKey = sessionPrivateKey;
        this.smartAccountAddress = smartAccountAddress;
        this.publicClient = createPublicClient({
            transport: http(mantleSepolia.rpcUrls.default.http[0]),
            chain: mantleSepolia,
        });
    }

    /**
     * Initialize the AI Agent's Kernel Account Client using the session key
     */
    async initialize() {
        console.log(`\n🤖 Initializing AI Agent for Smart Account: ${this.smartAccountAddress}`);

        const sessionKeySigner = privateKeyToAccount(this.sessionPrivateKey);
        console.log(`🔑 Session Key Address: ${sessionKeySigner.address}`);

        // Create ECDSA validator from session key
        const ecdsaValidator = await signerToEcdsaValidator(this.publicClient, {
            signer: sessionKeySigner,
            kernelVersion: KERNEL_V3_1,
        });

        // Create Kernel Account using session key
        const account = await createKernelAccount(this.publicClient, {
            plugins: {
                sudo: ecdsaValidator,
            },
            kernelVersion: KERNEL_V3_1,
            address: this.smartAccountAddress,
        });

        // Create Kernel Client with Paymaster
        this.kernelClient = createKernelAccountClient({
            account,
            chain: mantleSepolia,
            bundlerTransport: http(process.env.ZERODEV_BUNDLER_RPC),
            middleware: {
                sponsorUserOperation: async ({ userOperation }) => {
                    const paymasterClient = createZeroDevPaymasterClient({
                        chain: mantleSepolia,
                        transport: http(process.env.ZERODEV_PAYMASTER_RPC!),
                    });
                    return paymasterClient.sponsorUserOperation({
                        userOperation,
                    });
                },
            },
        });

        console.log(`✅ AI Agent initialized successfully\n`);
    }

    /**
     * Get current balances
     */
    async getBalances() {
        const [usdcBalance, goldBalance] = await Promise.all([
            this.publicClient.readContract({
                address: CONTRACTS.MOCK_USDC,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [this.smartAccountAddress],
            }),
            this.publicClient.readContract({
                address: CONTRACTS.MOCK_GOLD,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [this.smartAccountAddress],
            }),
        ]);

        return {
            usdc: usdcBalance as bigint,
            gold: goldBalance as bigint,
        };
    }

    /**
     * Get current gold price from oracle
     */
    async getGoldPrice() {
        const price = await this.publicClient.readContract({
            address: CONTRACTS.AUREO_POOL,
            abi: AUREO_POOL_ABI,
            functionName: 'getGoldPrice18Decimals',
        });

        return price as bigint;
    }

    /**
     * Execute Buy Gold transaction (Multicall: approve + buyGold)
     ** This demonstrates atomic execution of approve and buyGold in a single transaction
     */
    async executeBuyGold(usdcAmount: bigint) {
        console.log(`\n💰 Executing BUY GOLD`);
        console.log(`   USDC Amount: ${formatUnits(usdcAmount, 6)} USDC`);

        try {
            const balances = await this.getBalances();
            console.log(`   Current USDC Balance: ${formatUnits(balances.usdc, 6)}`);
            console.log(`   Current Gold Balance: ${formatUnits(balances.gold, 18).slice(0, 10)}`);

            if (balances.usdc < usdcAmount) {
                throw new Error('Insufficient USDC balance');
            }

            // Create multicall data
            const calls = [
                // 1. Approve AureoRWAPool to spend USDC
                {
                    to: CONTRACTS.MOCK_USDC,
                    value: 0n,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [CONTRACTS.AUREO_POOL, usdcAmount],
                    }),
                },
                // 2. Buy Gold
                {
                    to: CONTRACTS.AUREO_POOL,
                    value: 0n,
                    data: encodeFunctionData({
                        abi: AUREO_POOL_ABI,
                        functionName: 'buyGold',
                        args: [usdcAmount],
                    }),
                },
            ];

            console.log(`\n📦 Sending Multicall UserOperation (Approve + BuyGold)...`);

            // Send as a single atomic transaction
            const userOpHash = await this.kernelClient.sendUserOperation({
                userOperation: {
                    callData: await this.kernelClient.account.encodeCallData(calls),
                },
            });

            console.log(`✅ UserOp Hash: ${userOpHash}`);
            console.log(`⏳ Waiting for transaction confirmation...`);

            // Wait for receipt
            const receipt = await this.kernelClient.waitForUserOperationReceipt({
                hash: userOpHash,
            });

            console.log(`✅ Transaction confirmed!`);
            console.log(`   Receipt: ${receipt.receipt.transactionHash}`);

            // Get updated balances
            const newBalances = await this.getBalances();
            console.log(`\n📊 Updated Balances:`);
            console.log(`   USDC: ${formatUnits(newBalances.usdc, 6)}`);
            console.log(`   Gold: ${formatUnits(newBalances.gold, 18).slice(0, 10)}`);

            return receipt;
        } catch (error) {
            console.error(`❌ Error buying gold:`, error);
            throw error;
        }
    }

    /**
     * Execute Sell Gold transaction (Multicall: approve + sellGold)
     */
    async executeSellGold(goldAmount: bigint) {
        console.log(`\n💰 Executing SELL GOLD`);
        console.log(`   Gold Amount: ${formatUnits(goldAmount, 18).slice(0, 10)} mGOLD`);

        try {
            const balances = await this.getBalances();
            console.log(`   Current USDC Balance: ${formatUnits(balances.usdc, 6)}`);
            console.log(`   Current Gold Balance: ${formatUnits(balances.gold, 18).slice(0, 10)}`);

            if (balances.gold < goldAmount) {
                throw new Error('Insufficient Gold balance');
            }

            // Create multicall data
            const calls = [
                // 1. Approve AureoRWAPool to spend Gold
                {
                    to: CONTRACTS.MOCK_GOLD,
                    value: 0n,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [CONTRACTS.AUREO_POOL, goldAmount],
                    }),
                },
                // 2. Sell Gold
                {
                    to: CONTRACTS.AUREO_POOL,
                    value: 0n,
                    data: encodeFunctionData({
                        abi: AUREO_POOL_ABI,
                        functionName: 'sellGold',
                        args: [goldAmount],
                    }),
                },
            ];

            console.log(`\n📦 Sending Multicall UserOperation (Approve + SellGold)...`);

            const userOpHash = await this.kernelClient.sendUserOperation({
                userOperation: {
                    callData: await this.kernelClient.account.encodeCallData(calls),
                },
            });

            console.log(`✅ UserOp Hash: ${userOpHash}`);
            console.log(`⏳ Waiting for transaction confirmation...`);

            const receipt = await this.kernelClient.waitForUserOperationReceipt({
                hash: userOpHash,
            });

            console.log(`✅ Transaction confirmed!`);
            console.log(`   Receipt: ${receipt.receipt.transactionHash}`);

            const newBalances = await this.getBalances();
            console.log(`\n📊 Updated Balances:`);
            console.log(`   USDC: ${formatUnits(newBalances.usdc, 6)}`);
            console.log(`   Gold: ${formatUnits(newBalances.gold, 18).slice(0, 10)}`);

            return receipt;
        } catch (error) {
            console.error(`❌ Error selling gold:`, error);
            throw error;
        }
    }

    /**
     * AI Trading Logic - Placeholder for market-based decision making
     * In production, this would analyze market conditions and execute trades
     */
    async monitorAndTrade() {
        console.log(`\n🔍 Monitoring market conditions...`);

        try {
            const price = await this.getGoldPrice();
            const balances = await this.getBalances();

            console.log(`\n📊 Market Data:`);
            console.log(`   Gold Price: $${formatUnits(price, 18).slice(0, 10)}`);
            console.log(`   USDC Balance: ${formatUnits(balances.usdc, 6)}`);
            console.log(`   Gold Balance: ${formatUnits(balances.gold, 18).slice(0, 10)}`);

            // Example AI logic (placeholder)
            // In production, implement sophisticated market analysis here
            console.log(`\n🤖 AI Decision: Evaluating trade opportunity...`);
            console.log(`   (This is a placeholder - implement your trading strategy here)`);

            /*
            // Example: Buy if price is low and we have USDC
            if (price < parseUnits('2000', 18) && balances.usdc > parseUnits('10', 6)) {
              await this.executeBuyGold(parseUnits('10', 6));
            }
            
            // Example: Sell if price is high and we have Gold
            if (price > parseUnits('2500', 18) && balances.gold > parseUnits('0.01', 18)) {
              await this.executeSellGold(parseUnits('0.01', 18));
            }
            */
        } catch (error) {
            console.error(`❌ Error in monitor and trade:`, error);
        }
    }
}

/**
 * Demo: Execute a trade using the AI Agent
 */
async function demo() {
    // Example session key (replace with actual session key from your .env)
    const SESSION_KEY = process.env.SESSION_KEY_EXAMPLE as `0x${string}`;
    const SMART_ACCOUNT_ADDRESS = process.env.SMART_ACCOUNT_ADDRESS as Address;

    if (!SESSION_KEY || !SMART_ACCOUNT_ADDRESS) {
        console.error('❌ Please set SESSION_KEY_EXAMPLE and SMART_ACCOUNT_ADDRESS in .env');
        process.exit(1);
    }

    const agent = new AIAgent(SESSION_KEY, SMART_ACCOUNT_ADDRESS);
    await agent.initialize();

    // Demo: Buy 10 USDC worth of Gold
    await agent.executeBuyGold(parseUnits('10', 6));

    // Demo: Monitor market (placeholder)
    await agent.monitorAndTrade();
}

// Run demo if this file is executed directly
if (require.main === module) {
    demo().catch(console.error);
}

export default AIAgent;
