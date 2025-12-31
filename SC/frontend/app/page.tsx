'use client';

import { usePrivy } from '@privy-io/react-auth';
import WalletConnect from '@/components/WalletConnect';
import EnableAITrading from '@/components/EnableAITrading';
import { useState, useEffect } from 'react';
import { type Address } from 'viem';

export default function Home() {
    const { authenticated } = usePrivy();
    const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null);

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">Au</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                                    Aureo
                                </h1>
                                <p className="text-sm text-gray-600">RWA Gold Protocol</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-gray-600">Mantle Sepolia</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h2 className="text-5xl font-bold text-gray-900 mb-4">
                        Trade Gold with
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> AI Automation</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Create your isolated smart wallet, enable AI trading, and let the agent execute
                        USDC ↔ mGOLD swaps automatically based on market timing
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Wallet Connection */}
                    <div>
                        <WalletConnect />
                    </div>

                    {/* AI Trading Enablement */}
                    <div>
                        <EnableAITrading smartAccountAddress={smartAccountAddress} />
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-16">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Isolated Vaults</h3>
                        <p className="text-gray-600 text-sm">
                            Each user gets their own Kernel Smart Account deployed on Mantle Sepolia
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Scoped Permissions</h3>
                        <p className="text-gray-600 text-sm">
                            Session keys can only approve and trade - no direct token transfers allowed
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Gasless Transactions</h3>
                        <p className="text-gray-600 text-sm">
                            All trades are sponsored by ZeroDev Paymaster - no MNT needed for gas
                        </p>
                    </div>
                </div>

                {/* Contract Info */}
                <div className="mt-12 bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Deployed Contracts (Mantle Sepolia)</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">AureoRWAPool</p>
                            <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 p-2 rounded">
                                0x475F5c184D23D5839123e7CDB23273eF0470C018
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">MockUSDC (6 decimals)</p>
                            <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 p-2 rounded">
                                0x53b8e9e6513A2e7A4d23F8F9BFe3F5985C9788e4
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">MockGold (18 decimals)</p>
                            <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 p-2 rounded">
                                0x6830999D9173B235dF6ac8c9068c4235fd58f532
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600 text-sm">
                        Built with ZeroDev (Kernel v3) • Powered by Mantle Network • Secured by Pyth Oracles
                    </p>
                </div>
            </footer>
        </main>
    );
}
