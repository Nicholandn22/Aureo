'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import { createSessionKey } from '@/lib/ZeroDevSetup';
import { BACKEND_API_URL } from '@/config/constants';
import { type Address } from 'viem';

interface EnableAITradingProps {
    smartAccountAddress: Address | null;
}

export default function EnableAITrading({ smartAccountAddress }: EnableAITradingProps) {
    const { authenticated } = usePrivy();
    const { wallets } = useWallets();
    const [isEnabling, setIsEnabling] = useState(false);
    const [sessionKeyInfo, setSessionKeyInfo] = useState<{
        address: string;
        expiresAt: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleEnableAITrading = async () => {
        if (!authenticated || !smartAccountAddress || wallets.length === 0) {
            setError('Please connect your wallet first');
            return;
        }

        setIsEnabling(true);
        setError(null);

        try {
            const embeddedWallet = wallets[0];
            await embeddedWallet.switchChain(5003); // Mantle Sepolia

            const walletClient = await embeddedWallet.getWalletClient();

            // Create session key with 7 days expiry
            const sessionKey = await createSessionKey(walletClient, smartAccountAddress, 7 * 24 * 60 * 60);

            // Send session key to backend for storage
            const response = await fetch(`${BACKEND_API_URL}/api/session-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    smartAccountAddress,
                    sessionPrivateKey: sessionKey.sessionPrivateKey,
                    sessionAddress: sessionKey.sessionAddress,
                    expiresAt: sessionKey.expiresAt,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to store session key on backend');
            }

            setSessionKeyInfo({
                address: sessionKey.sessionAddress,
                expiresAt: sessionKey.expiresAt,
            });

            console.log('✅ AI Trading enabled successfully!');
        } catch (err) {
            console.error('Error enabling AI trading:', err);
            setError(err instanceof Error ? err.message : 'Failed to enable AI trading');
        } finally {
            setIsEnabling(false);
        }
    };

    if (!authenticated || !smartAccountAddress) {
        return null;
    }

    if (sessionKeyInfo) {
        const expiryDate = new Date(sessionKeyInfo.expiresAt * 1000);

        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-8 border border-green-200">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Trading Enabled! 🤖</h2>
                    <p className="text-gray-600 mb-4">
                        The AI Agent can now execute automated trades on your behalf
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Session Key Address</p>
                            <p className="font-mono text-sm text-gray-900 break-all">{sessionKeyInfo.address}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Expires At</p>
                            <p className="text-sm text-gray-900">{expiryDate.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Protected Permissions</h3>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>✓ Can only approve USDC/mGOLD to AureoRWAPool</li>
                                <li>✓ Can only call buyGold() and sellGold()</li>
                                <li>✗ Cannot transfer tokens directly</li>
                                <li>✗ Cannot interact with other contracts</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl p-8 border border-purple-200">
            <div className="text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">Enable AI Trading</h2>
                <p className="text-gray-600 mb-6">
                    Grant the AI Agent permission to execute automated USDC ↔ mGOLD swaps based on market timing
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleEnableAITrading}
                    disabled={isEnabling}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isEnabling ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enabling AI Trading...
                        </span>
                    ) : (
                        'Enable AI Trading'
                    )}
                </button>

                <div className="mt-6 bg-white rounded-xl p-4 text-left">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">What happens when you enable?</h3>
                    <ol className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start">
                            <span className="font-semibold mr-2">1.</span>
                            <span>A secure session key is generated with limited permissions</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-semibold mr-2">2.</span>
                            <span>You'll sign once to authorize the session key (7 days validity)</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-semibold mr-2">3.</span>
                            <span>AI Agent can execute trades without requiring your signature each time</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-semibold mr-2">4.</span>
                            <span>All transactions are gasless (sponsored by Paymaster)</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
