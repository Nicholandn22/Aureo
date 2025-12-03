'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sparkles, Shield, Zap, TrendingDown } from 'lucide-react';

export default function LandingPage() {
  const { login, authenticated } = usePrivy();

  if (authenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-background to-orange-50/30 dark:from-background dark:via-amber-950/10 dark:to-background"></div>
      
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-200/30 dark:bg-amber-700/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-200/30 dark:bg-orange-700/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
      
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={login} size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20">
              Launch App
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-200">AI-Powered Gold Wallet</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            The Intelligent
            <br />
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Gold Standard
            </span>
            <br />
            for Daily Payments
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Save in gold, spend in rupiah. AUREO uses AI to buy gold at the best prices and lets you spend it instantly for daily transactions.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={login} size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg px-8 shadow-lg shadow-amber-500/20">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30">
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">AI-Powered</div>
              <div className="text-sm text-muted-foreground">Smart Entry</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Real Gold</div>
              <div className="text-sm text-muted-foreground">RWA Backed</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Instant</div>
              <div className="text-sm text-muted-foreground">Spending</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose AUREO?</h2>
          <p className="text-xl text-muted-foreground">The future of digital savings and payments</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-lg">AI Smart Entry</CardTitle>
              <CardDescription className="leading-relaxed">
                Our AI analyzes market trends and buys gold at optimal prices, maximizing your savings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-lg">Gold Stability</CardTitle>
              <CardDescription className="leading-relaxed">
                Your savings are backed by real gold (RWA), protecting you from inflation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-lg">Instant Spending</CardTitle>
              <CardDescription className="leading-relaxed">
                Automatically convert gold to IDRX when you need to pay - seamless and instant
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-lg">Simple UX</CardTitle>
              <CardDescription className="leading-relaxed">
                No need to understand Web3 - just save and spend like any digital wallet
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">Three simple steps to start saving smart</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-6 items-start group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              1
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Deposit IDRX</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transfer rupiah to your AUREO wallet. Your funds are held securely while our AI monitors the gold market.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              2
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">AI Analyzes & Buys</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our Gemini-powered AI tracks gold prices using Pyth Network data and executes purchases at optimal moments.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              3
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Spend Anytime</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your balance is shown in grams of gold. When you pay, we instantly convert to IDRX in the background.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <Card className="backdrop-blur-sm bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/30 shadow-xl">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Save Smarter?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join AUREO today and let AI maximize your savings while keeping your money liquid
            </p>
            <Button onClick={login} size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg px-8 shadow-lg shadow-amber-500/20">
              Launch App Now
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 AUREO. Built for Hackathon 2025 on Mantle Testnet.</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
