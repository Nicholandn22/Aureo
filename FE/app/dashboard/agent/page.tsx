'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { MobileLayout } from '@/components/mobile-layout';
import { useAureoContract } from '@/lib/hooks/useAureoContract';
import { analyzeGoldMarket, chatWithAI, getMarketInsight, GoldMarketAnalysis } from '@/lib/services/aiService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Zap,
    Clock,
    BarChart3,
    Sliders,
    Brain,
    Shield,
    Loader2,
    Send,
    Sparkles,
    MessageSquare,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AnalysisHistory {
    id: string;
    analysis: GoldMarketAnalysis;
    timestamp: Date;
    executed: boolean;
}

export default function AgentPage() {
    const router = useRouter();
    const { ready, authenticated } = usePrivy();
    const { balances, isLoading: contractLoading, buyGold } = useAureoContract();

    // Agent Settings
    const [minConfidence, setMinConfidence] = useState(70);
    const [autoExecute, setAutoExecute] = useState(false);
    const [riskLevel, setRiskLevel] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

    // AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState<GoldMarketAnalysis | null>(null);
    const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
    const [marketInsight, setMarketInsight] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/');
        }
    }, [ready, authenticated, router]);

    // Fetch market insight on load
    useEffect(() => {
        if (balances.goldPrice > 0) {
            getMarketInsight(balances.goldPrice)
                .then(setMarketInsight)
                .catch(console.error);
        }
    }, [balances.goldPrice]);

    const runAnalysis = useCallback(async () => {
        if (balances.usdc <= 0) {
            setError('You need USDC to run analysis');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const analysis = await analyzeGoldMarket(balances.usdc, riskLevel);
            setCurrentAnalysis(analysis);

            // Add to history
            const historyEntry: AnalysisHistory = {
                id: Date.now().toString(),
                analysis,
                timestamp: new Date(),
                executed: false,
            };
            setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10

            // Auto-execute if enabled and conditions met
            if (autoExecute && analysis.action === 'BUY' && analysis.confidence >= minConfidence) {
                await executeRecommendation(analysis);
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to run AI analysis. Please check your API key.');
        } finally {
            setIsAnalyzing(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [balances.usdc, riskLevel, autoExecute, minConfidence]);

    const executeRecommendation = async (analysis: GoldMarketAnalysis) => {
        if (analysis.action !== 'BUY' || balances.usdc <= 0) return;

        try {
            const result = await buyGold(balances.usdc);
            if (result.success) {
                // Update history to mark as executed
                setAnalysisHistory(prev =>
                    prev.map(h =>
                        h.analysis === analysis ? { ...h, executed: true } : h
                    )
                );
                setError(null);
            } else {
                setError(result.error || 'Failed to execute trade');
            }
        } catch (err) {
            console.error('Execution error:', err);
            setError('Failed to execute trade');
        }
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput.trim(),
            timestamp: new Date(),
        };

        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsChatting(true);

        try {
            const response = await chatWithAI(
                userMessage.content,
                balances.goldPrice,
                balances.gold,
                balances.usdc
            );

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setChatMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Chat error:', err);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble responding right now. Please try again.",
                timestamp: new Date(),
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatting(false);
        }
    };

    if (!ready || !authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Calculate stats from history
    const stats = {
        totalAnalyses: analysisHistory.length,
        buyRecommendations: analysisHistory.filter(h => h.analysis.action === 'BUY').length,
        avgConfidence: analysisHistory.length > 0
            ? analysisHistory.reduce((sum, h) => sum + h.analysis.confidence, 0) / analysisHistory.length
            : 0,
        executedTrades: analysisHistory.filter(h => h.executed).length,
    };

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
                        <p className="text-sm text-muted-foreground">Powered by Gemini Flash</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
                    </div>
                </div>

                {/* Market Insight Banner */}
                {marketInsight && (
                    <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1">AI Market Insight</p>
                                <p className="text-sm">{marketInsight}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="text-xs text-muted-foreground">Gold Price</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">${balances.goldPrice.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">via Pyth Oracle</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-muted-foreground">Analyses</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.totalAnalyses}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.buyRecommendations} buy signals
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {/* Current Analysis */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Brain className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">AI Analysis</h3>
                                <p className="text-xs text-muted-foreground">Run market analysis</p>
                            </div>
                        </div>
                        <Button
                            onClick={runAnalysis}
                            disabled={isAnalyzing || contractLoading || balances.usdc <= 0}
                            size="sm"
                            className="rounded-xl"
                        >
                            {isAnalyzing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-1" />
                                    Analyze
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Analysis Result */}
                    {currentAnalysis && (
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentAnalysis.action === 'BUY'
                                            ? 'bg-green-100 dark:bg-green-500/20'
                                            : currentAnalysis.action === 'SELL'
                                                ? 'bg-red-100 dark:bg-red-500/20'
                                                : 'bg-amber-100 dark:bg-amber-500/20'
                                        }`}>
                                        {currentAnalysis.action === 'BUY' ? (
                                            <TrendingUp className="w-6 h-6 text-green-500" />
                                        ) : currentAnalysis.action === 'SELL' ? (
                                            <TrendingDown className="w-6 h-6 text-red-500" />
                                        ) : (
                                            <Clock className="w-6 h-6 text-amber-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{currentAnalysis.action}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {currentAnalysis.confidence}% confidence
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Risk</p>
                                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${currentAnalysis.riskLevel === 'low'
                                            ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                                            : currentAnalysis.riskLevel === 'high'
                                                ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                                : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                        }`}>
                                        {currentAnalysis.riskLevel}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">{currentAnalysis.reasoning}</p>

                            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                                <span className="text-muted-foreground">Target Price</span>
                                <span className="font-medium">${currentAnalysis.priceTarget.toFixed(2)}</span>
                            </div>

                            {currentAnalysis.action === 'BUY' && currentAnalysis.confidence >= minConfidence && (
                                <Button
                                    onClick={() => executeRecommendation(currentAnalysis)}
                                    disabled={contractLoading || balances.usdc <= 0}
                                    className="w-full bg-green-500 hover:bg-green-600"
                                >
                                    Execute: Buy ${balances.usdc.toFixed(2)} USDC Worth
                                </Button>
                            )}
                        </div>
                    )}

                    {/* No Analysis Yet */}
                    {!currentAnalysis && !isAnalyzing && (
                        <div className="p-8 text-center">
                            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">Click Analyze to get AI recommendations</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                USDC Balance: ${balances.usdc.toFixed(2)}
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isAnalyzing && (
                        <div className="p-8 text-center">
                            <Loader2 className="w-12 h-12 text-primary mx-auto mb-3 animate-spin" />
                            <p className="text-muted-foreground">Analyzing market conditions...</p>
                            <p className="text-xs text-muted-foreground mt-1">Using Gemini Flash AI</p>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

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
                                <p className="text-xs text-muted-foreground">Auto-buy when confident</p>
                            </div>
                            <button
                                onClick={() => setAutoExecute(!autoExecute)}
                                className={`w-12 h-7 rounded-full p-1 transition-colors ${autoExecute ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoExecute ? 'translate-x-5' : 'translate-x-0'}`} />
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
                        </div>
                    </div>
                </div>

                {/* AI Chat */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold">Chat with AI</h3>
                                <p className="text-xs text-muted-foreground">Ask about gold market</p>
                            </div>
                        </div>
                        <RefreshCw className={`w-5 h-5 text-muted-foreground transition-transform ${showChat ? 'rotate-180' : ''}`} />
                    </button>

                    {showChat && (
                        <div className="border-t border-border">
                            {/* Chat Messages */}
                            <div className="h-64 overflow-y-auto p-4 space-y-3">
                                {chatMessages.length === 0 && (
                                    <div className="text-center py-8">
                                        <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Ask me anything about gold investing!
                                        </p>
                                    </div>
                                )}
                                {chatMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                ? 'bg-primary text-white rounded-br-md'
                                                : 'bg-muted rounded-bl-md'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isChatting && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-border flex gap-2">
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                                    placeholder="Ask about gold..."
                                    className="flex-1 rounded-xl"
                                    disabled={isChatting}
                                />
                                <Button
                                    onClick={sendChatMessage}
                                    disabled={!chatInput.trim() || isChatting}
                                    size="icon"
                                    className="rounded-xl"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Analysis History */}
                {analysisHistory.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="font-semibold">Recent Analyses</h3>
                        </div>

                        <div className="divide-y divide-border max-h-80 overflow-y-auto">
                            {analysisHistory.slice(0, 5).map((entry) => (
                                <div key={entry.id} className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.analysis.action === 'BUY'
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                                }`}>
                                                {entry.analysis.action}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {entry.analysis.confidence}%
                                            </span>
                                            {entry.executed && (
                                                <span className="text-xs text-green-500">✓ Executed</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {entry.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{entry.analysis.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Gemini Info */}
                <div className="bg-gradient-to-r from-primary/10 to-blue-100/50 dark:from-primary/20 dark:to-blue-900/20 rounded-2xl p-4 border border-primary/20">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">Powered by Gemini Flash</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Fast &amp; affordable AI analysis using Google&apos;s Gemini 2.5 Flash model
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
