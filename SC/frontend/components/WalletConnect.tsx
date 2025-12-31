'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { createSmartAccount, getBalances } from '@/lib/ZeroDevSetup';
import { formatUnits, type Address } from 'viem';

export default function WalletConnect() {
    const { login, logout, authenticated, user } = usePrivy();
    const { wallets } = useWallets();
    const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null);
    const [balances, setBalances] = useState<{ usdc: bigint; gold: bigint } | null>(null);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    // Create smart account when user logs in
    useEffect(() => {
        const initSmartAccount = async () => {
            if (authenticated && wallets.length > 0 && !smartAccountAddress) {
                setIsCreatingAccount(true);
                try {
                    const embeddedWallet = wallets[0];
                    await embeddedWallet.switchChain(5003); // Mantle Sepolia

                    const walletClient = await embeddedWallet.getWalletClient();
                    const { smartAccountAddress: address } = await createSmartAccount(walletClient);

                    setSmartAccountAddress(address);

                    // Fetch balances
                    const bal = await getBalances(address);
                    setBalances(bal);
                } catch (error) {
                    console.error('Failed to create smart account:', error);
                } finally {
                    setIsCreatingAccount(false);
                }
            }
        };

        initSmartAccount();
    }, [authenticated, wallets, smartAccountAddress]);

    // Refresh balances periodically
    useEffect(() => {
        if (!smartAccountAddress) return;

        const interval = setInterval(async () => {
            try {
                const bal = await getBalances(smartAccountAddress);
                setBalances(bal);
            } catch (error) {
                console.error('Failed to fetch balances:', error);
            }
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
    }, [smartAccountAddress]);

    if (!authenticated) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Wallet</h2>
                    <p className="text-gray-600 mb-6">
                        Login with your social account to create a smart wallet
                    </p>
                    <button
                        onClick={login}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        Login with Privy
                    </button>
                </div>
            </div>
        );
    }

    if (isCreatingAccount) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Creating Your Smart Wallet</h2>
                    <p className="text-gray-600">
                        Please wait while we deploy your isolated vault on Mantle Sepolia...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Smart Wallet Connected</h2>
                        <p className="text-sm text-gray-500">{user?.email?.address || 'Connected'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Logout
                </button>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 mb-1">Smart Account Address</p>
                <p className="font-mono text-sm text-gray-900 break-all">{smartAccountAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">$</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">USDC</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {balances ? formatUnits(balances.usdc, 6) : '0.00'}
                    </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Au</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">mGOLD</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {balances ? formatUnits(balances.gold, 18).slice(0, 8) : '0.00'}
                    </p>
                </div>
            </div>
        </div>
    );
}
