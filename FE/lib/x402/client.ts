/**
 * x402 Payment Client for AUREO Frontend
 * 
 * Handles signing and sending x402 payments for premium AI services
 */

import { ethers, Eip1193Provider } from 'ethers';
import {
    X402_CONFIG,
    X402Payment,
    X402PaymentRequirement,
    encodePaymentHeader,
    formatUSDCAmount
} from './config';

// EIP-3009 receiveWithAuthorization signature types
const EIP3009_TYPES = {
    ReceiveWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
    ],
};

/**
 * x402 Payment Client - handles payment signing and request retry
 */
export class X402PaymentClient {
    private signer: ethers.Signer | null = null;
    private provider: ethers.BrowserProvider | null = null;

    /**
     * Initialize with wallet provider (e.g., from Privy)
     */
    async initialize(walletProvider: Eip1193Provider) {
        this.provider = new ethers.BrowserProvider(walletProvider);
        this.signer = await this.provider.getSigner();
    }

    /**
     * Get signer address
     */
    async getAddress(): Promise<string> {
        if (!this.signer) throw new Error('Client not initialized');
        return this.signer.getAddress();
    }

    /**
     * Sign an EIP-3009 authorization for x402 payment
     */
    async signPayment(requirement: X402PaymentRequirement): Promise<X402Payment> {
        if (!this.signer || !this.provider) {
            throw new Error('Payment client not initialized');
        }

        const from = await this.signer.getAddress();
        const nonce = ethers.hexlify(ethers.randomBytes(32));
        const validAfter = 0;
        const validBefore = requirement.validUntil;

        // EIP-712 domain for USDC
        const domain = {
            name: 'USDC',
            version: '1',
            chainId: requirement.chainId,
            verifyingContract: requirement.token,
        };

        const message = {
            from,
            to: requirement.payee,
            value: requirement.amount,
            validAfter,
            validBefore,
            nonce,
        };

        // Sign EIP-712 typed data
        const signature = await this.signer.signTypedData(domain, EIP3009_TYPES, message);
        const { v, r, s } = ethers.Signature.from(signature);

        return {
            version: '1',
            authorization: {
                from,
                to: requirement.payee,
                value: requirement.amount,
                validAfter,
                validBefore,
                nonce,
                v,
                r,
                s,
            },
        };
    }

    /**
     * Make a request with x402 payment handling
     * Automatically handles 402 responses and payment flow
     */
    async requestWithPayment<T>(
        url: string,
        options: RequestInit = {},
        onPaymentRequired?: (requirement: X402PaymentRequirement) => Promise<boolean>
    ): Promise<T> {
        // First attempt without payment
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // If not 402, return normally
        if (response.status !== 402) {
            if (!response.ok) {
                throw new Error(`Request failed: ${response.statusText}`);
            }
            return response.json();
        }

        // Handle 402 Payment Required
        const requirementHeader = response.headers.get(X402_CONFIG.headers.paymentRequired);
        if (!requirementHeader) {
            throw new Error('402 response missing payment requirement');
        }

        const requirement: X402PaymentRequirement = JSON.parse(
            Buffer.from(requirementHeader, 'base64').toString('utf-8')
        );

        // Ask user for confirmation if callback provided
        if (onPaymentRequired) {
            const confirmed = await onPaymentRequired(requirement);
            if (!confirmed) {
                throw new Error('Payment declined by user');
            }
        }

        // Sign the payment
        const payment = await this.signPayment(requirement);

        // Retry with payment header
        const retryResponse = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                [X402_CONFIG.headers.payment]: encodePaymentHeader(payment),
                ...options.headers,
            },
        });

        if (!retryResponse.ok) {
            throw new Error(`Payment request failed: ${retryResponse.statusText}`);
        }

        return retryResponse.json();
    }
}

// Singleton instance
export const x402Client = new X402PaymentClient();

/**
 * Hook-like helper for React components
 */
export function createPaymentConfirmation(
    requirement: X402PaymentRequirement
): {
    amount: string;
    description: string;
    payee: string;
} {
    return {
        amount: formatUSDCAmount(parseInt(requirement.amount)),
        description: requirement.description,
        payee: `${requirement.payee.slice(0, 6)}...${requirement.payee.slice(-4)}`,
    };
}
