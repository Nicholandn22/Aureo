/**
 * x402-Protected AI Smart Buy Endpoint
 * 
 * This endpoint allows the AI agent to execute smart buy operations
 * Protected by x402 - users pay $0.05 USDC per execution
 */

import { NextRequest, NextResponse } from 'next/server';
import { withX402Protection, X402_CONFIG } from '@/lib/x402';
import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const AI_AGENT_PRIVATE_KEY = process.env.AI_AGENT_PRIVATE_KEY || '';
const AUREO_POOL_ADDRESS = process.env.NEXT_PUBLIC_AUREO_POOL_ADDRESS || '0x475F5c184D23D5839123e7CDB23273eF0470C018';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x53b8e9e6513A2e7A4d23F8F9BFe3F5985C9788e4';

const AUREO_POOL_ABI = [
    'function buyGold(uint256 _usdcAmount) external',
    'function getGoldPrice18Decimals() external view returns (uint256)',
    'event BuyGold(address indexed user, uint256 usdcSpent, uint256 goldReceived, uint256 priceUsed)',
];

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
];

interface SmartBuyRequest {
    userAddress: string;
    usdcAmount: number;
    aiDecision: {
        action: 'BUY';
        confidence: number;
        reasoning: string;
        currentPrice: number;
    };
}

/**
 * Execute smart buy on behalf of user
 * Protected by x402 payment
 */
async function executeSmartBuy(
    request: NextRequest,
    payer: string
): Promise<NextResponse> {
    try {
        const body: SmartBuyRequest = await request.json();
        const { userAddress, usdcAmount, aiDecision } = body;

        // Validate AI decision
        if (aiDecision.action !== 'BUY') {
            return NextResponse.json(
                { error: 'AI decision must be BUY to execute smart buy' },
                { status: 400 }
            );
        }

        if (aiDecision.confidence < 60) {
            return NextResponse.json(
                { error: 'AI confidence too low for execution', confidence: aiDecision.confidence },
                { status: 400 }
            );
        }

        // Connect to blockchain
        const provider = new ethers.JsonRpcProvider(RPC_URL);

        // Use AI agent wallet for execution
        if (!AI_AGENT_PRIVATE_KEY) {
            return NextResponse.json(
                { error: 'AI agent not configured' },
                { status: 500 }
            );
        }

        const agentWallet = new ethers.Wallet(AI_AGENT_PRIVATE_KEY, provider);
        const aureoPool = new ethers.Contract(AUREO_POOL_ADDRESS, AUREO_POOL_ABI, agentWallet);
        const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, agentWallet);

        // Get current gold price
        const goldPrice = await aureoPool.getGoldPrice18Decimals();
        const priceUSD = Number(ethers.formatUnits(goldPrice, 18));

        // Calculate amount in USDC (6 decimals)
        const usdcAmountWei = ethers.parseUnits(usdcAmount.toString(), 6);

        // Check user's USDC balance
        const userBalance = await usdc.balanceOf(userAddress);
        if (userBalance < usdcAmountWei) {
            return NextResponse.json(
                { error: 'Insufficient USDC balance', required: usdcAmount, available: Number(ethers.formatUnits(userBalance, 6)) },
                { status: 400 }
            );
        }

        // Approve pool to spend USDC (if AI agent is the spender)
        // Note: In production, user would pre-approve or use EIP-2612 permit
        const approveTx = await usdc.approve(AUREO_POOL_ADDRESS, usdcAmountWei);
        await approveTx.wait();

        // Execute buy gold
        const buyTx = await aureoPool.buyGold(usdcAmountWei);
        const receipt = await buyTx.wait();

        // Parse event to get gold received
        const buyGoldEvent = receipt.logs.find((log: { topics: string[]; data: string }) => {
            try {
                return aureoPool.interface.parseLog(log)?.name === 'BuyGold';
            } catch {
                return false;
            }
        });

        let goldReceived = 0;
        if (buyGoldEvent) {
            const parsed = aureoPool.interface.parseLog(buyGoldEvent);
            goldReceived = Number(ethers.formatUnits(parsed?.args.goldReceived || 0, 18));
        }

        return NextResponse.json({
            success: true,
            txHash: receipt.hash,
            usdcSpent: usdcAmount,
            goldReceived,
            priceUsed: priceUSD,
            aiDecision,
            payer,
            x402Fee: X402_CONFIG.pricing.smartBuyExecution / 1_000_000,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Smart buy execution error:', error);
        return NextResponse.json(
            { error: 'Smart buy execution failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}

// Export with x402 protection - $0.05 USDC per smart buy
export const POST = withX402Protection(
    executeSmartBuy,
    X402_CONFIG.pricing.smartBuyExecution,
    'AI Smart Buy - Optimal gold purchase execution powered by AUREO AI'
);

// GET endpoint to check pricing
export async function GET() {
    return NextResponse.json({
        endpoint: '/api/x402/smart-buy',
        description: 'AI-powered smart buy execution for optimal gold purchases',
        pricing: {
            amount: X402_CONFIG.pricing.smartBuyExecution,
            amountUSDC: X402_CONFIG.pricing.smartBuyExecution / 1_000_000,
            currency: 'USDC',
            network: X402_CONFIG.paymentToken.network,
        },
        x402: {
            version: '1',
            payee: X402_CONFIG.payee,
            token: X402_CONFIG.paymentToken.address,
        },
    });
}
