/**
 * x402 Middleware for API Routes
 * 
 * Protects premium endpoints with x402 payment requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
    X402_CONFIG,
    parsePaymentHeader,
    generatePaymentRequirement
} from './config';

// USDC EIP-3009 ABI for receiveWithAuthorization
const USDC_ABI = [
    'function receiveWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external',
    'function authorizationState(address authorizer, bytes32 nonce) external view returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
];

/**
 * Validate and execute x402 payment
 */
export async function validateX402Payment(
    request: NextRequest,
    requiredAmount: number
): Promise<{ valid: boolean; error?: string; payer?: string }> {
    const paymentHeader = request.headers.get(X402_CONFIG.headers.payment);

    if (!paymentHeader) {
        return { valid: false, error: 'NO_PAYMENT' };
    }

    const payment = parsePaymentHeader(paymentHeader);
    if (!payment) {
        return { valid: false, error: 'INVALID_PAYMENT_FORMAT' };
    }

    const { authorization } = payment;

    // Validate payment amount
    if (BigInt(authorization.value) < BigInt(requiredAmount)) {
        return { valid: false, error: 'INSUFFICIENT_PAYMENT' };
    }

    // Validate payee
    if (authorization.to.toLowerCase() !== X402_CONFIG.payee.toLowerCase()) {
        return { valid: false, error: 'INVALID_PAYEE' };
    }

    // Validate timing
    const now = Math.floor(Date.now() / 1000);
    if (now < authorization.validAfter || now > authorization.validBefore) {
        return { valid: false, error: 'PAYMENT_EXPIRED' };
    }

    // Execute payment on-chain (optional - can be done async)
    try {
        const provider = new ethers.JsonRpcProvider(
            process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.mantle.xyz'
        );

        // Check if nonce already used
        const usdcContract = new ethers.Contract(
            X402_CONFIG.paymentToken.address,
            USDC_ABI,
            provider
        );

        const nonceUsed = await usdcContract.authorizationState(
            authorization.from,
            authorization.nonce
        );

        if (nonceUsed) {
            return { valid: false, error: 'NONCE_ALREADY_USED' };
        }

        // Check payer has sufficient balance
        const balance = await usdcContract.balanceOf(authorization.from);
        if (balance < BigInt(authorization.value)) {
            return { valid: false, error: 'INSUFFICIENT_BALANCE' };
        }

        // Execute receiveWithAuthorization (requires service wallet)
        if (process.env.X402_SERVICE_PRIVATE_KEY) {
            const serviceWallet = new ethers.Wallet(
                process.env.X402_SERVICE_PRIVATE_KEY,
                provider
            );
            const usdcWithSigner = usdcContract.connect(serviceWallet);

            const tx = await usdcWithSigner.receiveWithAuthorization(
                authorization.from,
                authorization.to,
                authorization.value,
                authorization.validAfter,
                authorization.validBefore,
                authorization.nonce,
                authorization.v,
                authorization.r,
                authorization.s
            );

            await tx.wait();
        }

        return { valid: true, payer: authorization.from };
    } catch (error) {
        console.error('x402 payment execution error:', error);
        return { valid: false, error: 'PAYMENT_EXECUTION_FAILED' };
    }
}

/**
 * Create 402 Payment Required response
 */
export function create402Response(
    resource: string,
    amount: number,
    description: string
): NextResponse {
    const requirement = generatePaymentRequirement(resource, amount, description);

    const requirementEncoded = Buffer.from(JSON.stringify(requirement)).toString('base64');

    return new NextResponse(
        JSON.stringify({
            error: 'Payment Required',
            requirement,
            message: `This endpoint requires a payment of ${amount / 1_000_000} USDC`,
        }),
        {
            status: 402,
            headers: {
                'Content-Type': 'application/json',
                [X402_CONFIG.headers.paymentRequired]: requirementEncoded,
            },
        }
    );
}

/**
 * x402 protected route wrapper
 */
export function withX402Protection(
    handler: (request: NextRequest, payer: string) => Promise<NextResponse>,
    amount: number,
    description: string
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const resource = request.nextUrl.pathname;

        // Check for payment header
        const hasPayment = request.headers.has(X402_CONFIG.headers.payment);

        if (!hasPayment) {
            return create402Response(resource, amount, description);
        }

        // Validate payment
        const validation = await validateX402Payment(request, amount);

        if (!validation.valid) {
            if (validation.error === 'NO_PAYMENT') {
                return create402Response(resource, amount, description);
            }

            return NextResponse.json(
                { error: `Payment failed: ${validation.error}` },
                { status: 400 }
            );
        }

        // Payment valid - execute handler
        return handler(request, validation.payer!);
    };
}
