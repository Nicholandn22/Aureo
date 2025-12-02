'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { DepositDialog } from '@/components/deposit-dialog';
import { WithdrawDialog } from '@/components/withdraw-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sparkles, TrendingUp, Wallet, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const [goldBalance, setGoldBalance] = useState(2.45); // Mock data in grams
  const [idrxPending, setIdrxPending] = useState(500000); // Mock pending IDRX
  const [aiStatus, setAiStatus] = useState<'analyzing' | 'ready' | 'bought'>('ready');
  const [goldPriceIDR, setGoldPriceIDR] = useState(1250000); // Mock: 1 gram = Rp 1,250,000

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const totalValueIDR = goldBalance * goldPriceIDR;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gray-300 dark:bg-gray-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-400 dark:bg-gray-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 flex items-center justify-center">
              <span className="text-2xl font-bold text-white dark:text-gray-900">A</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
              AUREO
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {user?.email?.address || user?.wallet?.address?.slice(0, 6) + '...' + user?.wallet?.address?.slice(-4)}
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Your intelligent gold wallet</p>
        </div>

        {/* Main Balance Card */}
        <Card className="mb-8 backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-2xl">
          <CardHeader>
            <CardDescription>Total Balance</CardDescription>
            <div className="space-y-2">
              <CardTitle className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                {goldBalance.toFixed(3)} g
              </CardTitle>
              <div className="text-2xl text-muted-foreground">
                ≈ Rp {totalValueIDR.toLocaleString('id-ID')}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <DepositDialog onDeposit={(amount: number) => {
                setIdrxPending(prev => prev + amount);
                setAiStatus('analyzing');
                // Simulate AI buying after 3 seconds
                setTimeout(() => {
                  const goldBought = amount / goldPriceIDR;
                  setGoldBalance(prev => prev + goldBought);
                  setIdrxPending(prev => prev - amount);
                  setAiStatus('bought');
                  setTimeout(() => setAiStatus('ready'), 2000);
                }, 3000);
              }}>
                <Button size="lg" className="flex-1 bg-foreground hover:bg-foreground/90 text-background">
                  <Wallet className="w-5 h-5 mr-2" />
                  Deposit
                </Button>
              </DepositDialog>
              
              <WithdrawDialog 
                goldBalance={goldBalance}
                goldPriceIDR={goldPriceIDR}
                onWithdraw={(grams: number) => {
                  setGoldBalance(prev => prev - grams);
                }}
              >
                <Button size="lg" variant="outline" className="flex-1">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Withdraw
                </Button>
              </WithdrawDialog>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Status Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-foreground/70" />
                  AI Agent Status
                </span>
                <div className={`w-3 h-3 rounded-full ${
                  aiStatus === 'analyzing' ? 'bg-blue-500 animate-pulse' :
                  aiStatus === 'bought' ? 'bg-green-500' :
                  'bg-gray-500'
                }`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiStatus === 'analyzing' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Analyzing market...</p>
                  <p className="text-sm text-muted-foreground">
                    Our AI is monitoring gold prices to find the best entry point for your deposit.
                  </p>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-foreground/70 animate-pulse" style={{width: '60%'}} />
                  </div>
                </div>
              )}
              {aiStatus === 'bought' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">✓ Purchase executed!</p>
                  <p className="text-sm text-muted-foreground">
                    AI successfully bought gold at optimal price. Your balance has been updated.
                  </p>
                </div>
              )}
              {aiStatus === 'ready' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ready to optimize</p>
                  <p className="text-sm text-muted-foreground">
                    AI is monitoring market 24/7. Make a deposit to start saving smarter.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Funds Card */}
          <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Pending Analysis</CardTitle>
              <CardDescription>Funds waiting for AI optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                Rp {idrxPending.toLocaleString('id-ID')}
              </div>
              <p className="text-sm text-muted-foreground">
                {idrxPending > 0 
                  ? 'AI will convert to gold at the best price'
                  : 'No pending funds. Make a deposit to start saving!'}
              </p>
            </CardContent>
          </Card>

          {/* Gold Price Card */}
          <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Current Gold Price</CardTitle>
              <CardDescription>Real-time via Pyth Network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                Rp {goldPriceIDR.toLocaleString('id-ID')}
              </div>
              <p className="text-sm text-foreground/70 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +2.3% (24h)
              </p>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">AI Purchase</p>
                    <p className="text-muted-foreground">2 hours ago</p>
                  </div>
                  <p className="text-foreground font-medium">+0.80 g</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">Deposit</p>
                    <p className="text-muted-foreground">Yesterday</p>
                  </div>
                  <p className="text-muted-foreground">Rp 1,000,000</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">AI Purchase</p>
                    <p className="text-muted-foreground">2 days ago</p>
                  </div>
                  <p className="text-foreground font-medium">+1.65 g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
