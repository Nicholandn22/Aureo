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
  const [goldBalance, setGoldBalance] = useState(2.45);
  const [idrxPending, setIdrxPending] = useState(500000);
  const [aiStatus, setAiStatus] = useState<'analyzing' | 'ready' | 'bought'>('ready');
  const [goldPriceIDR] = useState(1250000);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-background to-orange-50/30 dark:from-background dark:via-amber-950/10 dark:to-background"></div>

      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-amber-200/30 dark:bg-amber-700/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-200/30 dark:bg-orange-700/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">A</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
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

        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">Your intelligent gold wallet</p>
          </div>

          <Card className="mb-8 backdrop-blur-sm bg-card/50 border-border/60 shadow-xl">
            <CardHeader className="pb-4">
              <CardDescription className="text-sm font-medium">Total Balance</CardDescription>
              <div className="space-y-1 mt-2">
                <div className="flex items-baseline gap-2">
                  <CardTitle className="text-6xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
                    {goldBalance.toFixed(3)}
                  </CardTitle>
                  <span className="text-4xl font-semibold text-amber-600 dark:text-amber-400">g</span>
                </div>
                <div className="text-xl text-muted-foreground font-medium">
                  ≈ Rp {totalValueIDR.toLocaleString('id-ID')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-3">
                <DepositDialog onDeposit={(amount: number) => {
                  setIdrxPending(prev => prev + amount);
                  setAiStatus('analyzing');
                  setTimeout(() => {
                    const goldBought = amount / goldPriceIDR;
                    setGoldBalance(prev => prev + goldBought);
                    setIdrxPending(prev => prev - amount);
                    setAiStatus('bought');
                    setTimeout(() => setAiStatus('ready'), 2000);
                  }, 3000);
                }}>
                  <Button size="lg" className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 font-semibold">
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
                  <Button size="lg" variant="outline" className="flex-1 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-semibold">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Withdraw
                  </Button>
                </WithdrawDialog>
              </div>

              <div className="mt-6 pt-6 border-t border-border/60">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Wallet Address</span>
                  <code className="text-xs bg-secondary px-2 py-1 rounded">
                    {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    AI Agent Status
                  </span>
                  <div className={`w-3 h-3 rounded-full ${aiStatus === 'analyzing' ? 'bg-blue-500 animate-pulse' :
                      aiStatus === 'bought' ? 'bg-green-500' :
                        'bg-gray-500'
                    }`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiStatus === 'analyzing' && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Analyzing market...</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our AI is monitoring gold prices to find the best entry point for your deposit.
                    </p>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
                {aiStatus === 'bought' && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">✓ Purchase executed!</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI successfully bought gold at optimal price. Your balance has been updated.
                    </p>
                  </div>
                )}
                {aiStatus === 'ready' && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Ready to optimize</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI is monitoring market 24/7. Make a deposit to start saving smarter.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Pending Analysis</CardTitle>
                <CardDescription>Funds waiting for AI optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  Rp {idrxPending.toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {idrxPending > 0
                    ? 'AI will convert to gold at the best price'
                    : 'No pending funds. Make a deposit to start saving!'}
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Current Gold Price</CardTitle>
                <CardDescription>Real-time via Pyth Network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  Rp {goldPriceIDR.toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +2.3% (24h)
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">AI Purchase</p>
                      <p className="text-muted-foreground">2 hours ago</p>
                    </div>
                    <p className="text-amber-600 dark:text-amber-400 font-medium">+0.80 g</p>
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
                    <p className="text-amber-600 dark:text-amber-400 font-medium">+1.65 g</p>
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
