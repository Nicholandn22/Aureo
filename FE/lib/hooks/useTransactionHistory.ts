'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/services/contractService';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.mantle.xyz';

export interface Transaction {
    id: string;
    type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out';
    amount: number;
    goldAmount?: number;
    price?: number;
    timestamp: Date;
    txHash: string;
    status: 'completed' | 'pending' | 'failed';
    description: string;
    blockNumber: number;
    asset: 'usdc' | 'gold';
}

export interface TransactionFilters {
    type?: 'all' | 'buy' | 'sell' | 'transfer';
    startDate?: Date;
    endDate?: Date;
}

/**
 * Hook to fetch transaction history from blockchain events
 */
export function useTransactionHistory(walletAddress: string | undefined) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!walletAddress) return;

        setIsLoading(true);
        setError(null);

        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const aureoContract = new ethers.Contract(
                CONTRACT_ADDRESSES.AUREO_POOL,
                CONTRACT_ABIS.AUREO_POOL,
                provider
            );
            const goldContract = new ethers.Contract(
                CONTRACT_ADDRESSES.M_GOLD,
                CONTRACT_ABIS.M_GOLD,
                provider
            );
            const usdcContract = new ethers.Contract(
                CONTRACT_ADDRESSES.M_USDC,
                CONTRACT_ABIS.M_USDC,
                provider
            );

            const txList: Transaction[] = [];
            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10000 blocks

            // Fetch BuyGold events
            try {
                const buyFilter = aureoContract.filters.BuyGold(walletAddress);
                const buyEvents = await aureoContract.queryFilter(buyFilter, fromBlock, currentBlock);

                for (const event of buyEvents) {
                    const block = await event.getBlock();
                    const log = event as ethers.EventLog;

                    if (log.args) {
                        const usdcSpent = Number(ethers.formatUnits(log.args.usdcSpent || 0, 18));
                        const goldReceived = Number(ethers.formatUnits(log.args.goldReceived || 0, 18));
                        const priceUsed = Number(ethers.formatUnits(log.args.priceUsed || 0, 18));

                        txList.push({
                            id: `buy-${event.transactionHash}`,
                            type: 'buy',
                            amount: usdcSpent,
                            goldAmount: goldReceived,
                            price: priceUsed,
                            timestamp: new Date(block.timestamp * 1000),
                            txHash: event.transactionHash,
                            status: 'completed',
                            description: `Bought ${goldReceived.toFixed(6)} mGold`,
                            blockNumber: event.blockNumber,
                            asset: 'gold' 
                        });
                    }
                }
            } catch (e) {
                console.error('Error fetching BuyGold events:', e);
            }

            // Fetch SellGold events
            try {
                const sellFilter = aureoContract.filters.SellGold(walletAddress);
                const sellEvents = await aureoContract.queryFilter(sellFilter, fromBlock, currentBlock);

                for (const event of sellEvents) {
                    const block = await event.getBlock();
                    const log = event as ethers.EventLog;

                    if (log.args) {
                        const goldSold = Number(ethers.formatUnits(log.args.goldSold || 0, 18));
                        const usdcReceived = Number(ethers.formatUnits(log.args.usdcReceived || 0, 18));
                        const priceUsed = Number(ethers.formatUnits(log.args.priceUsed || 0, 18));

                        txList.push({
                            id: `sell-${event.transactionHash}`,
                            type: 'sell',
                            amount: usdcReceived,
                            goldAmount: goldSold,
                            price: priceUsed,
                            timestamp: new Date(block.timestamp * 1000),
                            txHash: event.transactionHash,
                            status: 'completed',
                            description: `Sold ${goldSold.toFixed(6)} mGold`,
                            blockNumber: event.blockNumber,
                            asset: 'usdc'
                        });
                    }
                }
            } catch (e) {
                console.error('Error fetching SellGold events:', e);
            }

            // Fetch mGold Transfer events (incoming)
            try {
                const transferInFilter = goldContract.filters.Transfer(null, walletAddress);
                const transferInEvents = await goldContract.queryFilter(transferInFilter, fromBlock, currentBlock);

                for (const event of transferInEvents) {
                    const block = await event.getBlock();
                    const log = event as ethers.EventLog;

                    // Filter out transfers from Aureo Pool (handled by BuyGold)
                    if (log.args && log.args.from !== CONTRACT_ADDRESSES.AUREO_POOL && log.args.from !== ethers.ZeroAddress) {
                        const value = Number(ethers.formatUnits(log.args.value || 0, 18));
                        const from = log.args.from as string;

                        txList.push({
                            id: `gold-in-${event.transactionHash}`,
                            type: 'transfer_in',
                            amount: 0,
                            goldAmount: value,
                            timestamp: new Date(block.timestamp * 1000),
                            txHash: event.transactionHash,
                            status: 'completed',
                            description: `Received mGold from ${from.slice(0, 6)}...${from.slice(-4)}`,
                            blockNumber: event.blockNumber,
                            asset: 'gold'
                        });
                    }
                }
            } catch (e) {
                console.error('Error fetching Gold Transfer In events:', e);
            }

            // Fetch mGold Transfer events (outgoing)
            try {
                const transferOutFilter = goldContract.filters.Transfer(walletAddress, null);
                const transferOutEvents = await goldContract.queryFilter(transferOutFilter, fromBlock, currentBlock);

                for (const event of transferOutEvents) {
                    const block = await event.getBlock();
                    const log = event as ethers.EventLog;

                    // Filter out transfers to Aureo Pool (handled by SellGold)
                    if (log.args && log.args.to !== CONTRACT_ADDRESSES.AUREO_POOL && log.args.to !== ethers.ZeroAddress) {
                        const value = Number(ethers.formatUnits(log.args.value || 0, 18));
                        const to = log.args.to as string;

                        txList.push({
                            id: `gold-out-${event.transactionHash}`,
                            type: 'transfer_out',
                            amount: 0,
                            goldAmount: value,
                            timestamp: new Date(block.timestamp * 1000),
                            txHash: event.transactionHash,
                            status: 'completed',
                            description: `Sent mGold to ${to.slice(0, 6)}...${to.slice(-4)}`,
                            blockNumber: event.blockNumber,
                            asset: 'gold'
                        });
                    }
                }
            } catch (e) {
                console.error('Error fetching Gold Transfer Out events:', e);
            }

             // Fetch USDC Transfer events (incoming)
             try {
                const transferInFilter = usdcContract.filters.Transfer(null, walletAddress);
                const transferInEvents = await usdcContract.queryFilter(transferInFilter, fromBlock, currentBlock);
                const decimals = await usdcContract.decimals();

                for (const event of transferInEvents) {
                    const block = await event.getBlock();
                    const log = event as ethers.EventLog;

                    // Filter out transfers from Aureo Pool (handled by SellGold)
                     if (log.args && log.args.from !== CONTRACT_ADDRESSES.AUREO_POOL && log.args.from !== ethers.ZeroAddress) {
                        const value = Number(ethers.formatUnits(log.args.value || 0, decimals));
                        const from = log.args.from as string;

                        txList.push({
                            id: `usdc-in-${event.transactionHash}`,
                            type: 'transfer_in',
                            amount: value,
                            timestamp: new Date(block.timestamp * 1000),
                            txHash: event.transactionHash,
                            status: 'completed',
                            description: `Received USDC from ${from.slice(0, 6)}...${from.slice(-4)}`,
                            blockNumber: event.blockNumber,
                            asset: 'usdc'
                        });
                    }
                }
            } catch (e) {
                console.error('Error fetching USDC Transfer In events:', e);
            }

            // Fetch USDC Transfer events (outgoing)
            try {
                const transferOutFilter = usdcContract.filters.Transfer(walletAddress, null);
                const transferOutEvents = await usdcContract.queryFilter(transferOutFilter, fromBlock, currentBlock);
                const decimals = await usdcContract.decimals();

                for (const event of transferOutEvents) {
                    const block = await event.getBlock();
                    const log = event as ethers.EventLog;

                    // Filter out transfers to Aureo Pool (handled by BuyGold)
                    if (log.args && log.args.to !== CONTRACT_ADDRESSES.AUREO_POOL && log.args.to !== ethers.ZeroAddress) {
                        const value = Number(ethers.formatUnits(log.args.value || 0, decimals));
                        const to = log.args.to as string;

                        txList.push({
                            id: `usdc-out-${event.transactionHash}`,
                            type: 'transfer_out',
                            amount: value,
                            timestamp: new Date(block.timestamp * 1000),
                            txHash: event.transactionHash,
                            status: 'completed',
                            description: `Sent USDC to ${to.slice(0, 6)}...${to.slice(-4)}`,
                            blockNumber: event.blockNumber,
                            asset: 'usdc'
                        });
                    }
                }
            } catch (e) {
                console.error('Error fetching USDC Transfer Out events:', e);
            }

            // Sort by timestamp (newest first)
            txList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setTransactions(txList);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Failed to fetch transaction history');
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filterTransactions = useCallback((filters: TransactionFilters): Transaction[] => {
        return transactions.filter(tx => {
            if (filters.type && filters.type !== 'all') {
                if (filters.type === 'transfer') {
                    if (tx.type !== 'transfer_in' && tx.type !== 'transfer_out') return false;
                } else if (tx.type !== filters.type) return false;
            }
            if (filters.startDate && tx.timestamp < filters.startDate) return false;
            if (filters.endDate && tx.timestamp > filters.endDate) return false;
            return true;
        });
    }, [transactions]);

    return {
        transactions,
        isLoading,
        error,
        refetch: fetchTransactions,
        filterTransactions,
    };
}

export function formatTransactionDate(date: Date): { date: string; time: string } {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let dateStr: string;
    if (diffDays === 0) {
        dateStr = 'Today';
    } else if (diffDays === 1) {
        dateStr = 'Yesterday';
    } else if (diffDays < 7) {
        dateStr = `${diffDays} days ago`;
    } else {
        dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return { date: dateStr, time: timeStr };
}
