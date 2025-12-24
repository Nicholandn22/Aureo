'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Share2, Copy, Check } from 'lucide-react';
import { useState, Suspense } from 'react';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [copied, setCopied] = useState(false);

    const amount = searchParams.get('amount') || '0';
    const recipient = searchParams.get('to') || '';

    const copyTxHash = async () => {
        await navigator.clipboard.writeText('0x1234567890abcdef...');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mobile-container bg-background min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                {/* Success Animation */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center animate-fade-in">
                        <CheckCircle className="w-14 h-14 text-green-500" />
                    </div>
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-500/30 animate-ping" />
                </div>

                <h1 className="text-2xl font-bold mb-2">Payment Sent!</h1>
                <p className="text-muted-foreground mb-8">
                    Your USDC has been successfully transferred
                </p>

                {/* Amount */}
                <div className="bg-card rounded-2xl p-6 border border-border w-full max-w-sm mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Amount Sent</p>
                    <p className="text-4xl font-bold text-foreground">
                        ${parseFloat(amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">USDC</p>
                </div>

                {/* Details */}
                <div className="bg-muted rounded-2xl p-4 w-full max-w-sm space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">To</span>
                        <span className="font-mono">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network</span>
                        <span>Mantle Sepolia</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground">Transaction</span>
                        <button onClick={copyTxHash} className="flex items-center gap-1 text-primary">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span className="font-mono">0x1234...abcd</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 space-y-3">
                <Button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-2xl text-base"
                >
                    Back to Home
                </Button>
                <Button
                    variant="outline"
                    className="w-full py-6 rounded-2xl text-base"
                >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Receipt
                </Button>
            </div>
        </div>
    );
}

export default function PaySuccessPage() {
    return (
        <Suspense fallback={
            <div className="mobile-container bg-background min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
