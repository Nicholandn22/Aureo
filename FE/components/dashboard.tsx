"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { DepositDialog } from "@/components/deposit-dialog";
import { WithdrawDialog } from "@/components/withdraw-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAureoContract } from "@/lib/hooks/useAureoContract";
import {
  Sparkles,
  TrendingUp,
  Wallet,
  LogOut,
  RefreshCw,
  ExternalLink,
  Coins,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const {
    balances,
    isLoading,
    error,
    isConnected: _isConnected,
    walletAddress,
    fetchBalances,
    buyGold,
    sellGold,
    mintTestUSDC,
    contractAddresses,
  } = useAureoContract();

  const [aiStatus, setAiStatus] = useState<
    "analyzing" | "ready" | "bought" | "error"
  >("ready");
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

  // Calculate total value in USD
  const totalValueUSD = balances.gold * balances.goldPrice;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleDeposit = async (amount: number) => {
    setAiStatus("analyzing");
    setNotification(null);

    const result = await buyGold(amount);

    if (result.success) {
      setAiStatus("bought");
      setLastTxHash(result.txHash || null);
      setNotification({
        type: "success",
        message: `Successfully purchased gold! TX: ${result.txHash?.slice(0, 10)}...`,
      });
      setTimeout(() => setAiStatus("ready"), 3000);
    } else {
      setAiStatus("error");
      setNotification({
        type: "error",
        message: result.error || "Transaction failed",
      });
      setTimeout(() => setAiStatus("ready"), 3000);
    }
  };

  const handleWithdraw = async (grams: number) => {
    setAiStatus("analyzing");
    setNotification(null);

    const result = await sellGold(grams);

    if (result.success) {
      setAiStatus("bought");
      setLastTxHash(result.txHash || null);
      setNotification({
        type: "success",
        message: `Successfully sold gold! TX: ${result.txHash?.slice(0, 10)}...`,
      });
      setTimeout(() => setAiStatus("ready"), 3000);
    } else {
      setAiStatus("error");
      setNotification({
        type: "error",
        message: result.error || "Transaction failed",
      });
      setTimeout(() => setAiStatus("ready"), 3000);
    }
  };

  const handleMintTestUSDC = async () => {
    setNotification(null);
    const result = await mintTestUSDC(1000); // Mint 1000 test USDC

    if (result.success) {
      setNotification({ type: "success", message: "Minted 1000 test USDC!" });
    } else {
      setNotification({
        type: "error",
        message: result.error || "Failed to mint USDC",
      });
    }
  };

  const explorerUrl = `https://explorer.sepolia.mantle.xyz/address/${walletAddress}`;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-background to-orange-50/30 dark:from-background dark:via-amber-950/10 dark:to-background"></div>

      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-amber-200/30 dark:bg-amber-700/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-pulse"></div>
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-200/30 dark:bg-orange-700/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right ${
            notification.type === "success"
              ? "bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800"
              : "bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span
            className={
              notification.type === "success"
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }
          >
            {notification.message}
          </span>
        </div>
      )}

      <div className="relative z-10">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/Aureo.png"
                alt="AUREO Logo"
                width={36}
                height={36}
                className="w-9 h-9 rounded-xl shadow-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                AUREO
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchBalances}
                disabled={isLoading}
                className="text-muted-foreground"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <div className="text-sm text-muted-foreground hidden sm:block">
                {user?.email?.address ||
                  walletAddress?.slice(0, 6) + "..." + walletAddress?.slice(-4)}
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
            <p className="text-muted-foreground">
              Your intelligent gold wallet
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          )}

          {/* Main Balance Card */}
          <Card className="mb-8 backdrop-blur-sm bg-card/50 border-border/60 shadow-xl">
            <CardHeader className="pb-4">
              <CardDescription className="text-sm font-medium">
                Total Gold Balance
              </CardDescription>
              <div className="space-y-1 mt-2">
                <div className="flex items-baseline gap-2">
                  <CardTitle className="text-6xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
                    {balances.gold.toFixed(6)}
                  </CardTitle>
                  <span className="text-4xl font-semibold text-amber-600 dark:text-amber-400">
                    mGold
                  </span>
                </div>
                <div className="text-xl text-muted-foreground font-medium">
                  ≈ ${totalValueUSD.toFixed(2)} USD
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-3 flex-wrap">
                <DepositDialog
                  onDeposit={handleDeposit}
                  usdcBalance={balances.usdc}
                  isLoading={isLoading}
                >
                  <Button
                    size="lg"
                    className="flex-1 min-w-[140px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 font-semibold"
                    disabled={isLoading}
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Buy Gold
                  </Button>
                </DepositDialog>

                <WithdrawDialog
                  goldBalance={balances.gold}
                  goldPriceUSD={balances.goldPrice}
                  onWithdraw={handleWithdraw}
                  isLoading={isLoading}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 min-w-[140px] border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-semibold"
                    disabled={isLoading}
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Sell Gold
                  </Button>
                </WithdrawDialog>

                {/* Testnet Faucet Button */}
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleMintTestUSDC}
                  disabled={isLoading}
                  className="min-w-[140px]"
                >
                  <Coins className="w-5 h-5 mr-2" />
                  Get Test USDC
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Wallet Address</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-secondary px-2 py-1 rounded">
                      {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                    </code>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">USDC Balance</span>
                  <span className="font-medium">
                    ${balances.usdc.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Agent Status */}
            <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Transaction Status
                  </span>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      aiStatus === "analyzing"
                        ? "bg-blue-500 animate-pulse"
                        : aiStatus === "bought"
                          ? "bg-green-500"
                          : aiStatus === "error"
                            ? "bg-red-500"
                            : "bg-gray-500"
                    }`}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiStatus === "analyzing" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Processing transaction...
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Please confirm the transaction in your wallet and wait for
                      confirmation.
                    </p>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 animate-pulse"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                )}
                {aiStatus === "bought" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      ✓ Transaction completed!
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your transaction has been confirmed on the blockchain.
                    </p>
                    {lastTxHash && (
                      <a
                        href={`https://explorer.sepolia.mantle.xyz/tx/${lastTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-600 hover:underline flex items-center gap-1"
                      >
                        View on Explorer <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
                {aiStatus === "error" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">
                      ✗ Transaction failed
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Please check your balance and try again.
                    </p>
                  </div>
                )}
                {aiStatus === "ready" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Ready to trade</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Buy or sell gold tokens instantly at the current market
                      price.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Gold Price */}
            <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Current Gold Price</CardTitle>
                <CardDescription>
                  Real-time via Pyth Network Oracle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  ${balances.goldPrice.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  per mGold token (18 decimals)
                </p>
              </CardContent>
            </Card>

            {/* Contract Info */}
            <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Smart Contracts</CardTitle>
                <CardDescription>Deployed on Mantle Sepolia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Aureo Pool</span>
                  <a
                    href={`https://explorer.sepolia.mantle.xyz/address/${contractAddresses.AUREO_POOL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs hover:text-amber-600 flex items-center gap-1"
                  >
                    {contractAddresses.AUREO_POOL.slice(0, 6)}...
                    {contractAddresses.AUREO_POOL.slice(-4)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">mGold Token</span>
                  <a
                    href={`https://explorer.sepolia.mantle.xyz/address/${contractAddresses.M_GOLD}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs hover:text-amber-600 flex items-center gap-1"
                  >
                    {contractAddresses.M_GOLD.slice(0, 6)}...
                    {contractAddresses.M_GOLD.slice(-4)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">mUSDC Token</span>
                  <a
                    href={`https://explorer.sepolia.mantle.xyz/address/${contractAddresses.M_USDC}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs hover:text-amber-600 flex items-center gap-1"
                  >
                    {contractAddresses.M_USDC.slice(0, 6)}...
                    {contractAddresses.M_USDC.slice(-4)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Network Info */}
            <Card className="backdrop-blur-sm bg-card/50 border-border/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Network</CardTitle>
                <CardDescription>Connected blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <div>
                    <p className="font-medium">Mantle Sepolia</p>
                    <p className="text-sm text-muted-foreground">
                      Testnet (Chain ID: 5003)
                    </p>
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
