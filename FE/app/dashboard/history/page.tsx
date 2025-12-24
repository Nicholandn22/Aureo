'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { MobileLayout } from '@/components/mobile-layout';
import {
    ArrowLeft,
    ArrowUpRight,
    ArrowDownLeft,
    Sparkles,
    Search,
    Filter,
    Calendar,
    Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdraw' | 'send' | 'receive' | 'ai_purchase';
    amount: number;
    unit: 'USDC' | 'gram';
    timestamp: string;
    date: string;
    status: 'completed' | 'pending';
    description: string;
    txHash?: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const { ready, authenticated } = usePrivy();
    const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw' | 'send'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const transactions: Transaction[] = [
        {
            id: '1',
            type: 'ai_purchase',
            amount: 0.150,
            unit: 'gram',
            timestamp: '10:30 AM',
            date: 'Today',
            status: 'completed',
            description: 'AI Smart Purchase',
            txHash: '0x1234...5678',
        },
        {
            id: '2',
            type: 'deposit',
            amount: 50.00,
            unit: 'USDC',
            timestamp: '3:45 PM',
            date: 'Yesterday',
            status: 'completed',
            description: 'Top Up via Wallet',
            txHash: '0x2345...6789',
        },
        {
            id: '3',
            type: 'send',
            amount: 25.00,
            unit: 'USDC',
            timestamp: '11:20 AM',
            date: 'Yesterday',
            status: 'completed',
            description: 'Sent to Alice (0x742d...Fa89)',
            txHash: '0x3456...7890',
        },
        {
            id: '4',
            type: 'ai_purchase',
            amount: 0.320,
            unit: 'gram',
            timestamp: '9:15 AM',
            date: 'Dec 22, 2024',
            status: 'completed',
            description: 'AI Smart Purchase',
            txHash: '0x4567...8901',
        },
        {
            id: '5',
            type: 'receive',
            amount: 100.00,
            unit: 'USDC',
            timestamp: '2:00 PM',
            date: 'Dec 21, 2024',
            status: 'completed',
            description: 'Received from Bob',
            txHash: '0x5678...9012',
        },
        {
            id: '6',
            type: 'withdraw',
            amount: 0.500,
            unit: 'gram',
            timestamp: '4:30 PM',
            date: 'Dec 20, 2024',
            status: 'completed',
            description: 'Withdraw to USDC',
            txHash: '0x6789...0123',
        },
    ];

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/');
        }
    }, [ready, authenticated, router]);

    if (!ready || !authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'receive':
                return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
            case 'withdraw':
            case 'send':
                return <ArrowUpRight className="w-5 h-5 text-orange-500" />;
            case 'ai_purchase':
                return <Sparkles className="w-5 h-5 text-amber-500" />;
            default:
                return null;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'receive':
                return 'bg-green-100 dark:bg-green-500/20';
            case 'withdraw':
            case 'send':
                return 'bg-orange-100 dark:bg-orange-500/20';
            case 'ai_purchase':
                return 'bg-amber-100 dark:bg-amber-500/20';
            default:
                return 'bg-muted';
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter !== 'all' && tx.type !== filter) return false;
        if (searchQuery && !tx.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
        const date = tx.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(tx);
        return groups;
    }, {} as Record<string, Transaction[]>);

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
                    <h1 className="text-xl font-semibold">Transaction History</h1>
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
                        { id: 'deposit', label: 'Deposits' },
                        { id: 'send', label: 'Sent' },
                        { id: 'withdraw', label: 'Withdrawals' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as typeof filter)}
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

            {/* Transaction List */}
            <div className="px-4 py-4 space-y-6">
                {Object.entries(groupedTransactions).map(([date, txs]) => (
                    <div key={date}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {date}
                        </h3>
                        <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
                            {txs.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                                        {getTransactionIcon(tx.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">{tx.description}</p>
                                        <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'ai_purchase'
                                                ? 'text-green-500'
                                                : 'text-foreground'
                                            }`}>
                                            {tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'ai_purchase' ? '+' : '-'}
                                            {tx.amount.toFixed(tx.unit === 'gram' ? 3 : 2)} {tx.unit === 'gram' ? 'g' : 'USDC'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No transactions found</p>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
