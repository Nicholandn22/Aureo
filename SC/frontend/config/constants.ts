import { defineChain } from 'viem';

/**
 * Mantle Sepolia Testnet Configuration
 */
export const mantleSepolia = defineChain({
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
            http: [process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz'],
        },
        public: {
            http: ['https://rpc.sepolia.mantle.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Mantle Sepolia Explorer',
            url: 'https://explorer.sepolia.mantle.xyz',
        },
    },
    testnet: true,
});

/**
 * Contract Addresses on Mantle Sepolia
 */
export const CONTRACTS = {
    AUREO_POOL: (process.env.NEXT_PUBLIC_AUREO_POOL_ADDRESS || '0x475F5c184D23D5839123e7CDB23273eF0470C018') as `0x${string}`,
    MOCK_USDC: (process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || '0x53b8e9e6513A2e7A4d23F8F9BFe3F5985C9788e4') as `0x${string}`,
    MOCK_GOLD: (process.env.NEXT_PUBLIC_MOCK_GOLD_ADDRESS || '0x6830999D9173B235dF6ac8c9068c4235fd58f532') as `0x${string}`,
};

/**
 * ZeroDev Configuration
 */
export const ZERODEV_CONFIG = {
    projectId: process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || '',
    bundlerRpc: process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_RPC || '',
    paymasterRpc: process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_RPC || '',
};

/**
 * Backend API URL
 */
export const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

/**
 * AureoRWAPool ABI (minimal - only functions we need)
 */
export const AUREO_POOL_ABI = [
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

/**
 * ERC20 ABI (minimal - only functions we need)
 */
export const ERC20_ABI = [
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
    {
        type: 'function',
        name: 'decimals',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'symbol',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
    },
] as const;
