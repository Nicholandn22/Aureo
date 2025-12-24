'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/mobile-layout';
import { WalletCard } from '@/components/wallet-card';
import { QuickActions } from '@/components/quick-actions';
import { DepositDialog } from '@/components/deposit-dialog';
import { WithdrawDialog } from '@/components/withdraw-dialog';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Settings,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'send' | 'receive' | 'ai_purchase';
  amount: number;
  unit: 'USDC' | 'gram';
  timestamp: string;
  status: 'completed' | 'pending';
  description: string;
}

export default function DashboardPage() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();

  const [goldBalance, setGoldBalance] = useState(2.450);
  const [usdcBalance, setUsdcBalance] = useState(150.00);
  const [goldPriceUSD, setGoldPriceUSD] = useState(65.50); // Price per gram
  const [aiStatus, setAiStatus] = useState<'analyzing' | 'ready' | 'bought'>('ready');
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'ai_purchase',
      amount: 0.150,
      unit: 'gram',
      timestamp: '2 hours ago',
      status: 'completed',
      description: 'AI Smart Purchase',
    },
    {
      id: '2',
      type: 'deposit',
      amount: 50.00,
      unit: 'USDC',
      timestamp: 'Yesterday',
      status: 'completed',
      description: 'Top Up',
    },
    {
      id: '3',
      type: 'send',
      amount: 25.00,
      unit: 'USDC',
      timestamp: '2 days ago',
      status: 'completed',
      description: 'Sent to 0x742d...Fa89',
    },
    {
      id: '4',
      type: 'ai_purchase',
      amount: 0.320,
      unit: 'gram',
      timestamp: '3 days ago',
      status: 'completed',
      description: 'AI Smart Purchase',
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
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleDeposit = (amount: number) => {
    setUsdcBalance(prev => prev + amount);
    setAiStatus('analyzing');

    // Simulate AI purchase
    setTimeout(() => {
      const goldBought = amount / goldPriceUSD;
      setGoldBalance(prev => prev + goldBought);
      setUsdcBalance(prev => prev - amount);
      setAiStatus('bought');
      setTimeout(() => setAiStatus('ready'), 2000);
    }, 3000);
  };

  const handleWithdraw = (grams: number) => {
    setGoldBalance(prev => prev - grams);
    const usdcAmount = grams * goldPriceUSD;
    setUsdcBalance(prev => prev + usdcAmount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'withdraw':
      case 'send':
        return <ArrowUpRight className="w-5 h-5 text-orange-500" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'ai_purchase':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
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

  return (
    <MobileLayout activeTab="home">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-sm">Good morning 👋</p>
            <h1 className="text-xl font-bold text-foreground">
              {user?.email?.address?.split('@')[0] || 'User'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-muted hover:bg-secondary transition-colors relative">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="p-2.5 rounded-xl bg-muted hover:bg-secondary transition-colors"
            >
              <Settings className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Wallet Card */}
        <WalletCard
          balance={usdcBalance}
          goldBalance={goldBalance}
          goldPriceUSD={goldPriceUSD}
          walletAddress={user?.wallet?.address}
          variant="gold"
        />
      </div>

      <div className="px-4 space-y-6 animate-fade-in">
        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <QuickActions
            onDeposit={() => setShowDepositDialog(true)}
            onWithdraw={() => setShowWithdrawDialog(true)}
          />
        </div>

        {/* AI Status Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiStatus === 'analyzing' ? 'bg-blue-100 dark:bg-blue-500/20' :
                aiStatus === 'bought' ? 'bg-green-100 dark:bg-green-500/20' :
                  'bg-amber-100 dark:bg-amber-500/20'
              }`}>
              <Sparkles className={`w-5 h-5 ${aiStatus === 'analyzing' ? 'text-blue-500 animate-pulse' :
                  aiStatus === 'bought' ? 'text-green-500' :
                    'text-amber-500'
                }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">AI Agent</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${aiStatus === 'analyzing' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                    aiStatus === 'bought' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
                  }`}>
                  {aiStatus === 'analyzing' ? 'Analyzing' :
                    aiStatus === 'bought' ? 'Purchased' : 'Ready'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {aiStatus === 'analyzing'
                  ? 'Finding the best entry point for your deposit...'
                  : aiStatus === 'bought'
                    ? 'Successfully purchased gold at optimal price!'
                    : 'Monitoring market 24/7 for smart entry points'
                }
              </p>
              {aiStatus === 'analyzing' && (
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gold Price */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Au</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gold Price</p>
                <p className="text-xl font-bold text-foreground">
                  ${goldPriceUSD.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">/gram</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-500 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+1.2%</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <button
              onClick={() => router.push('/dashboard/history')}
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              See All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-border">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className={`transaction-icon ${getTransactionColor(tx.type)}`}>
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
                  <span className={`status-badge ${tx.status}`}>
                    {tx.status === 'completed' ? 'Success' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deposit Dialog */}
      <DepositDialog onDeposit={handleDeposit}>
        <button
          ref={(el) => {
            if (showDepositDialog && el) {
              el.click();
              setShowDepositDialog(false);
            }
          }}
          className="hidden"
        />
      </DepositDialog>

      {/* Withdraw Dialog */}
      <WithdrawDialog
        goldBalance={goldBalance}
        goldPriceIDR={goldPriceUSD * 15000} // Convert to IDR
        onWithdraw={handleWithdraw}
      >
        <button
          ref={(el) => {
            if (showWithdrawDialog && el) {
              el.click();
              setShowWithdrawDialog(false);
            }
          }}
          className="hidden"
        />
      </WithdrawDialog>
    </MobileLayout>
  );
}
