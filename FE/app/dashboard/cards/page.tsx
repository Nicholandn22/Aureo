'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { MobileLayout } from '@/components/mobile-layout';
import {
    ArrowLeft,
    Plus,
    CreditCard,
    Sparkles,
    Eye,
    EyeOff,
    Lock,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VirtualCard {
    id: string;
    name: string;
    number: string;
    expiry: string;
    cvv: string;
    balance: number;
    color: 'gold' | 'blue' | 'dark';
    isActive: boolean;
}

export default function CardsPage() {
    const router = useRouter();
    const { ready, authenticated } = usePrivy();
    const [showCardDetails, setShowCardDetails] = useState<string | null>(null);
    const [selectedCard, setSelectedCard] = useState(0);

    const cards: VirtualCard[] = [
        {
            id: '1',
            name: 'AUREO Gold Card',
            number: '4532 •••• •••• 7890',
            expiry: '12/28',
            cvv: '***',
            balance: 160.50,
            color: 'gold',
            isActive: true,
        },
        {
            id: '2',
            name: 'AUREO Savings',
            number: '4532 •••• •••• 1234',
            expiry: '06/27',
            cvv: '***',
            balance: 450.00,
            color: 'blue',
            isActive: true,
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

    const getCardGradient = (color: string) => {
        switch (color) {
            case 'gold':
                return 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600';
            case 'blue':
                return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700';
            case 'dark':
                return 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900';
            default:
                return 'bg-gradient-to-br from-gray-700 to-gray-900';
        }
    };

    return (
        <MobileLayout activeTab="cards">
            {/* Header */}
            <div className="bg-background px-4 pt-12 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="p-2 rounded-full bg-muted hover:bg-secondary transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-semibold">My Cards</h1>
                    </div>
                    <Button size="sm" className="bg-primary text-white rounded-xl">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Card
                    </Button>
                </div>
            </div>

            {/* Cards Carousel */}
            <div className="px-4 mb-6">
                <div className="overflow-x-auto -mx-4 px-4 pb-4">
                    <div className="flex gap-4">
                        {cards.map((card, index) => (
                            <div
                                key={card.id}
                                onClick={() => setSelectedCard(index)}
                                className={`flex-shrink-0 w-72 cursor-pointer transition-transform ${selectedCard === index ? 'scale-100' : 'scale-95 opacity-80'
                                    }`}
                            >
                                <div className={`${getCardGradient(card.color)} rounded-2xl p-6 text-white relative overflow-hidden`}>
                                    {/* Card Pattern */}
                                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                                        <svg viewBox="0 0 100 100" fill="currentColor">
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
                                            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                                        </svg>
                                    </div>

                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            <span className="font-medium text-sm">{card.name}</span>
                                        </div>
                                        <div className="w-8 h-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded opacity-70" />
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-lg font-mono tracking-wider">
                                            {showCardDetails === card.id ? '4532 8901 2345 7890' : card.number}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs opacity-70">Balance</p>
                                            <p className="font-semibold">${card.balance.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-70">Expires</p>
                                            <p className="font-semibold">{card.expiry}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowCardDetails(showCardDetails === card.id ? null : card.id);
                                            }}
                                            className="p-2 bg-white/10 rounded-lg"
                                        >
                                            {showCardDetails === card.id ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card Indicators */}
                <div className="flex justify-center gap-2 mt-2">
                    {cards.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${selectedCard === index ? 'bg-primary' : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 space-y-4">
                <div className="bg-card rounded-2xl border border-border p-4">
                    <h3 className="font-semibold mb-4">Card Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center gap-3 p-4 bg-muted rounded-xl hover:bg-secondary transition-colors">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium">View Details</span>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-muted rounded-xl hover:bg-secondary transition-colors">
                            <Lock className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-medium">Lock Card</span>
                        </button>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border p-4">
                    <h3 className="font-semibold mb-3">Recent Card Transactions</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Coffee Shop', amount: -4.50, date: 'Today, 10:30 AM' },
                            { name: 'Online Store', amount: -25.00, date: 'Yesterday, 3:15 PM' },
                            { name: 'Top Up', amount: 50.00, date: 'Dec 22, 2024' },
                        ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-sm">{tx.name}</p>
                                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                                </div>
                                <span className={`font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} USDC
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
