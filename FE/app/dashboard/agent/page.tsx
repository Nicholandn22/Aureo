'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { MobileLayout } from '@/components/mobile-layout';
import {
    ArrowLeft,
    TrendingUp,
    Zap,
    Clock,
    BarChart3,
    Sliders,
    Brain,
    Shield,
    Loader2
} from 'lucide-react';

interface AgentExecution {
    id: string;
    timestamp: string;
    action: 'BUY' | 'WAIT';
    confidence: number;
    goldPrice: number;
    amount?: number;
    goldReceived?: number;
    x402Fee: number;
    status: 'success' | 'skipped' | 'failed';
    reasoning: string;
}

interface AgentStats {
    totalExecutions: number;
    successfulBuys: number;
    avgConfidence: number;
    totalX402Spent: number;
    avgSavings: number;
    lastExecution: string;
}

export default function AgentPage() {
    const router = useRouter();
    const { ready, authenticated } = usePrivy();

    // Agent Settings
    const [minConfidence, setMinConfidence] = useState(70);
    const [autoExecute, setAutoExecute] = useState(true);
    const [maxWaitTime, setMaxWaitTime] = useState(30); // minutes
    const [riskLevel, setRiskLevel] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

    // Mock data
    const [stats] = useState<AgentStats>({
        totalExecutions: 47,
        successfulBuys: 38,
        avgConfidence: 78.5,
        totalX402Spent: 2.35,
        avgSavings: 1.8,
        lastExecution: '2 hours ago',
    });

    const [executions] = useState<AgentExecution[]>([
        {
            id: '1',
            timestamp: '2 hours ago',
            action: 'BUY',
            confidence: 85,
            goldPrice: 65.42,
            amount: 50,
            goldReceived: 0.764,
            x402Fee: 0.05,
            status: 'success',
            reasoning: 'Price near 24h low, strong buying signal detected',
        },
        {
            id: '2',
            timestamp: '6 hours ago',
            action: 'WAIT',
            confidence: 65,
            goldPrice: 66.10,
            x402Fee: 0.01,
            status: 'skipped',
            reasoning: 'Price trending upward, waiting for pullback',
        },
        {
            id: '3',
            timestamp: 'Yesterday',
            action: 'BUY',
            confidence: 92,
            goldPrice: 64.85,
            amount: 100,
            goldReceived: 1.542,
            x402Fee: 0.05,
            status: 'success',
            reasoning: 'Excellent dip opportunity, high volatility reversal',
        },
        {
            id: '4',
            timestamp: 'Yesterday',
            action: 'BUY',
            confidence: 75,
            goldPrice: 65.20,
            amount: 25,
            goldReceived: 0.383,
            x402Fee: 0.05,
            status: 'success',
            reasoning: 'Price below EMA, good entry point',
        },
        {
            id: '5',
            timestamp: '2 days ago',
            action: 'WAIT',
            confidence: 55,
            goldPrice: 66.50,
            x402Fee: 0.01,
            status: 'skipped',
            reasoning: 'Market too volatile, risk assessment high',
        },
    ]);

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

    const successRate = ((stats.successfulBuys / stats.totalExecutions) * 100).toFixed(1);

    return (
        <MobileLayout activeTab="agent">
            {/* Header */}
            <div className="bg-gradient-to-b from-primary/10 to-background px-4 pt-12 pb-6">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 rounded-full bg-muted hover:bg-secondary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold">AI Agent</h1>
                        <p className="text-sm text-muted-foreground">Configure & monitor</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="text-xs text-muted-foreground">Success Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-green-500">{successRate}%</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.successfulBuys}/{stats.totalExecutions} executions
                        </p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-amber-500" />
                            <span className="text-xs text-muted-foreground">Avg Savings</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.avgSavings}%</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            vs market buy
                        </p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-muted-foreground">Avg Confidence</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.avgConfidence}%</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            decision quality
                        </p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-muted-foreground">x402 Spent</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">${stats.totalX402Spent}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            total fees
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {/* Agent Settings */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Sliders className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Agent Settings</h3>
                            <p className="text-xs text-muted-foreground">Customize AI behavior</p>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Auto Execute Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Auto Execute</p>
                                <p className="text-xs text-muted-foreground">Automatically buy when confident</p>
                            </div>
                            <button
                                onClick={() => setAutoExecute(!autoExecute)}
                                className={`w-12 h-7 rounded-full p-1 transition-colors ${autoExecute ? 'bg-primary' : 'bg-muted'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoExecute ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>

                        {/* Minimum Confidence */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-sm">Minimum Confidence</p>
                                <span className="text-sm font-bold text-primary">{minConfidence}%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="95"
                                value={minConfidence}
                                onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>50% (More trades)</span>
                                <span>95% (Fewer trades)</span>
                            </div>
                        </div>

                        {/* Max Wait Time */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-sm">Max Wait Time</p>
                                <span className="text-sm font-bold text-primary">{maxWaitTime} min</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="60"
                                step="5"
                                value={maxWaitTime}
                                onChange={(e) => setMaxWaitTime(parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Force buy if no optimal entry found
                            </p>
                        </div>

                        {/* Risk Level */}
                        <div>
                            <p className="font-medium text-sm mb-2">Risk Level</p>
                            <div className="grid grid-cols-3 gap-2">
                                {(['conservative', 'moderate', 'aggressive'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setRiskLevel(level)}
                                        className={`py-2 px-3 rounded-xl text-xs font-medium capitalize transition-colors ${riskLevel === level
                                            ? 'bg-primary text-white'
                                            : 'bg-muted text-foreground hover:bg-secondary'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {riskLevel === 'conservative' && 'Prioritizes safety, may miss opportunities'}
                                {riskLevel === 'moderate' && 'Balanced approach between safety and returns'}
                                {riskLevel === 'aggressive' && 'Maximizes opportunities, higher volatility'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* x402 Info */}
                <div className="bg-gradient-to-r from-primary/10 to-blue-100/50 dark:from-primary/20 dark:to-blue-900/20 rounded-2xl p-4 border border-primary/20">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">x402 Protocol Fees</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                AI Analysis: <span className="font-medium text-foreground">$0.01 USDC</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Smart Buy: <span className="font-medium text-foreground">$0.05 USDC</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Execution History */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="font-semibold">Execution History</h3>
                        </div>
                        <button className="text-sm text-primary font-medium">See All</button>
                    </div>

                    <div className="divide-y divide-border">
                        {executions.map((exec) => (
                            <div key={exec.id} className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${exec.action === 'BUY'
                                            ? 'bg-green-100 dark:bg-green-500/20'
                                            : 'bg-amber-100 dark:bg-amber-500/20'
                                            }`}>
                                            {exec.action === 'BUY' ? (
                                                <TrendingUp className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-amber-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{exec.action}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${exec.status === 'success'
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                                                    : exec.status === 'skipped'
                                                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                                        : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                                    }`}>
                                                    {exec.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{exec.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{exec.confidence}%</p>
                                        <p className="text-xs text-muted-foreground">confidence</p>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground mb-2">{exec.reasoning}</p>

                                <div className="flex items-center gap-4 text-xs">
                                    <span className="text-muted-foreground">
                                        Gold: <span className="text-foreground font-medium">${exec.goldPrice}</span>
                                    </span>
                                    {exec.goldReceived && (
                                        <span className="text-green-500 font-medium">
                                            +{exec.goldReceived.toFixed(3)} g
                                        </span>
                                    )}
                                    <span className="text-muted-foreground">
                                        Fee: <span className="text-foreground">${exec.x402Fee}</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
