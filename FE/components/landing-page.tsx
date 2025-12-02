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
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-300 dark:bg-gray-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-400 dark:bg-gray-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={login} size="lg" className="bg-foreground hover:bg-foreground/90 text-background">
              Launch App
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-gray-300/50 dark:border-gray-600/50 shadow-lg">
            <Sparkles className="w-4 h-4 text-foreground/70" />
            <span className="text-sm font-medium text-foreground">AI-Powered Gold Wallet</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            The Intelligent
            <br />
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
              Gold Standard
            </span>
            <br />
            for Daily Payments
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Save in gold, spend in rupiah. AUREO uses AI to buy gold at the best prices and lets you spend it instantly for daily transactions.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={login} size="lg" className="bg-foreground hover:bg-foreground/90 text-background text-lg px-8">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12">
            <div>
              <div className="text-3xl font-bold text-foreground">AI-Powered</div>
              <div className="text-sm text-muted-foreground">Smart Entry</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">Real Gold</div>
              <div className="text-sm text-muted-foreground">RWA Backed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">Instant</div>
              <div className="text-sm text-muted-foreground">Spending</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose AUREO?</h2>
          <p className="text-xl text-muted-foreground">The future of digital savings and payments</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-foreground/70" />
              </div>
              <CardTitle>AI Smart Entry</CardTitle>
              <CardDescription>
                Our AI analyzes market trends and buys gold at optimal prices, maximizing your savings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-foreground/70" />
              </div>
              <CardTitle>Gold Stability</CardTitle>
              <CardDescription>
                Your savings are backed by real gold (RWA), protecting you from inflation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-foreground/70" />
              </div>
              <CardTitle>Instant Spending</CardTitle>
              <CardDescription>
                Automatically convert gold to IDRX when you need to pay - seamless and instant
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-foreground/70" />
              </div>
              <CardTitle>Simple UX</CardTitle>
              <CardDescription>
                No need to understand Web3 - just save and spend like any digital wallet
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">Three simple steps to start saving smart</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-300 text-white dark:text-gray-900 font-bold flex items-center justify-center text-xl shrink-0">
              1
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Deposit IDRX</h3>
              <p className="text-muted-foreground">
                Transfer rupiah to your AUREO wallet. Your funds are held securely while our AI monitors the gold market.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-300 text-white dark:text-gray-900 font-bold flex items-center justify-center text-xl shrink-0">
              2
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">AI Analyzes & Buys</h3>
              <p className="text-muted-foreground">
                Our Gemini-powered AI tracks gold prices using Pyth Network data and executes purchases at optimal moments.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-300 text-white dark:text-gray-900 font-bold flex items-center justify-center text-xl shrink-0">
              3
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Spend Anytime</h3>
              <p className="text-muted-foreground">
                Your balance is shown in grams of gold. When you pay, we instantly convert to IDRX in the background.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-2xl">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Save Smarter?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join AUREO today and let AI maximize your savings while keeping your money liquid
            </p>
            <Button onClick={login} size="lg" className="bg-foreground hover:bg-foreground/90 text-background text-lg px-8">
              Launch App Now
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 AUREO. Built for Hackathon 2025 on Mantle Testnet.</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
