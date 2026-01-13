'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { MobileLayout } from '@/components/mobile-layout';
import { useTransactionHistory, formatTransactionDate, Transaction } from '@/lib/hooks/useTransactionHistory';
import {
    ArrowLeft,
    ArrowUpRight,
    ArrowDownLeft,
    Sparkles,
    Search,
    Calendar,
    Loader2,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

type FilterType = 'all' | 'buy' | 'sell' | 'transfer';

export default function HistoryPage() {
    const router = useRouter();
    const { ready, authenticated, user } = usePrivy();
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const walletAddress = user?.wallet?.address;
    const { transactions, isLoading, error, refetch } = useTransactionHistory(walletAddress);

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/');
        }
    }, [ready, authenticated, router]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            // Apply type filter
            if (filter !== 'all') {
                if (filter === 'transfer') {
                    if (tx.type !== 'transfer_in' && tx.type !== 'transfer_out') return false;
                } else if (tx.type !== filter) return false;
            }

            // Apply search filter
            if (searchQuery) {
                const search = searchQuery.toLowerCase();
                return (
                    tx.description.toLowerCase().includes(search) ||
                    tx.txHash.toLowerCase().includes(search)
                );
            }

            return true;
        });
    }, [transactions, filter, searchQuery]);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};

        filteredTransactions.forEach(tx => {
            const { date } = formatTransactionDate(tx.timestamp);
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(tx);
        });

        return groups;
    }, [filteredTransactions]);

    if (!ready || !authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const getTransactionIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'buy':
            case 'transfer_in':
                return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
            case 'sell':
            case 'transfer_out':
                return <ArrowUpRight className="w-5 h-5 text-orange-500" />;
            default:
                return <Sparkles className="w-5 h-5 text-amber-500" />;
        }
    };

    const getTransactionColor = (type: Transaction['type']) => {
        switch (type) {
            case 'buy':
            case 'transfer_in':
                return 'bg-green-100 dark:bg-green-500/20';
            case 'sell':
            case 'transfer_out':
                return 'bg-orange-100 dark:bg-orange-500/20';
            default:
                return 'bg-amber-100 dark:bg-amber-500/20';
        }
    };

    const getAmountDisplay = (tx: Transaction) => {
        if (tx.type === 'buy') {
            return {
                primary: `+${tx.goldAmount?.toFixed(6) || '0'} mGold`,
                secondary: `-$${tx.amount.toFixed(2)} USDC`,
                isPositive: true,
            };
        } else if (tx.type === 'sell') {
            return {
                primary: `+$${tx.amount.toFixed(2)} USDC`,
                secondary: `-${tx.goldAmount?.toFixed(6) || '0'} mGold`,
                isPositive: true,
            };
        } else if (tx.type === 'transfer_in') {
            if (tx.asset === 'usdc') {
                return {
                    primary: `+$${tx.amount.toFixed(2)} USDC`,
                    secondary: 'Received',
                    isPositive: true,
                };
            } else {
                return {
                    primary: `+${tx.goldAmount?.toFixed(6) || '0'} mGold`,
                    secondary: 'Received',
                    isPositive: true,
                };
            }
        } else {
            if (tx.asset === 'usdc') {
                return {
                    primary: `-$${tx.amount.toFixed(2)} USDC`,
                    secondary: 'Sent',
                    isPositive: false,
                };
            } else {
                return {
                    primary: `-${tx.goldAmount?.toFixed(6) || '0'} mGold`,
                    secondary: 'Sent',
                    isPositive: false,
                };
            }
        }
    };

    const explorerBaseUrl = 'https://explorer.sepolia.mantle.xyz/tx/';

    return (
        <MobileLayout activeTab="history">
            {/* Header */}
            <div className="bg-background sticky top-0 z-40 px-4 pt-12 pb-4 border-b border-border">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 rounded-full bg-muted hover:bg-secondary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-semibold flex-1">Transaction History</h1>
                    <button
                        onClick={refetch}
                        disabled={isLoading}
                        className="p-2 rounded-full bg-muted hover:bg-secondary transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search transactions..."
                        className="pl-10 py-5 rounded-xl"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'buy', label: 'Buy' },
                        { id: 'sell', label: 'Sell' },
                        { id: 'transfer', label: 'Transfers' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as FilterType)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f.id
                                ? 'bg-primary text-white'
                                : 'bg-muted text-foreground hover:bg-secondary'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && transactions.length === 0 && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Loading transactions from blockchain...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="px-4 py-4">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-red-600 dark:text-red-400 text-center">
                        {error}
                        <button onClick={refetch} className="block mx-auto mt-2 underline">
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* Transaction List */}
            <div className="px-4 py-4 space-y-6">
                {Object.entries(groupedTransactions).map(([date, txs]) => (
                    <div key={date}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {date}
                        </h3>
                        <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
                            {txs.map((tx) => {
                                const { time } = formatTransactionDate(tx.timestamp);
                                const amountDisplay = getAmountDisplay(tx);

                                return (
                                    <div key={tx.id} className="p-4 flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                                            {getTransactionIcon(tx.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">{tx.description}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{time}</span>
                                                <a
                                                    href={`${explorerBaseUrl}${tx.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 hover:text-primary"
                                                >
                                                    <span className="font-mono">{tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${amountDisplay.isPositive ? 'text-green-500' : 'text-foreground'}`}>
                                                {amountDisplay.primary}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{amountDisplay.secondary}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {!isLoading && filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No transactions found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {transactions.length === 0
                                ? 'Make your first trade to see history here'
                                : 'Try adjusting your filters'}
                        </p>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
