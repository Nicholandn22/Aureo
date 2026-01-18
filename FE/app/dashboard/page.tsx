"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { WalletCard } from "@/components/wallet-card";
import { QuickActions } from "@/components/quick-actions";
import { DepositDialog } from "@/components/deposit-dialog";
import { WithdrawDialog } from "@/components/withdraw-dialog";
import { useAureoContract } from "@/lib/hooks/useAureoContract";
import {
  useTransactionHistory,
  formatTransactionDate,
} from "@/lib/hooks/useTransactionHistory";
import {
  Bell,
  Settings,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Coins,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Reserve threshold - keep this much USDC liquid
const RESERVE_THRESHOLD = 100;

export default function DashboardPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();

  // Real contract data
  const {
    balances,
    isLoading: contractLoading,
    error: contractError,
    isConnected,
    walletAddress,
    fetchBalances,
    buyGold,
    sellGold,
    mintTestUSDC,
    contractAddresses,
  } = useAureoContract();

  // Transaction history from blockchain
  const {
    transactions,
    isLoading: txLoading,
    refetch: refetchTx,
  } = useTransactionHistory(walletAddress);

  // UI State
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // Auto-DCA state
  const [autoDCAEnabled, setAutoDCAEnabled] = useState(true);
  const [autoDCAStatus, setAutoDCAStatus] = useState<
    "idle" | "checking" | "converting" | "done"
  >("idle");

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

  // Auto-DCA: Check and convert excess USDC to Gold
  const runAutoDCA = useCallback(async () => {
    if (!autoDCAEnabled || !isConnected || contractLoading) return;

    const excessUSDC = balances.usdc - RESERVE_THRESHOLD;

    if (excessUSDC > 1) {
      // At least $1 to convert
      setAutoDCAStatus("checking");

      try {
        setAutoDCAStatus("converting");
        const result = await buyGold(excessUSDC);

        if (result.success) {
          setAutoDCAStatus("done");
          setNotification({
            type: "success",
            message: `Auto-converted $${excessUSDC.toFixed(2)} USDC to mGold`,
          });
          await fetchBalances();
          await refetchTx();
          setTimeout(() => setAutoDCAStatus("idle"), 3000);
        } else {
          setNotification({
            type: "error",
            message: result.error || "Auto-DCA failed",
          });
          setAutoDCAStatus("idle");
        }
      } catch (error) {
        console.error("Auto-DCA error:", error);
        setAutoDCAStatus("idle");
      }
    }
  }, [
    autoDCAEnabled,
    isConnected,
    contractLoading,
    balances.usdc,
    buyGold,
    fetchBalances,
    refetchTx,
  ]);

  // Handle manual buy gold (from deposit dialog)
  const handleBuyGold = async (amount: number) => {
    setIsProcessing(true);
    try {
      const result = await buyGold(amount);
      if (result.success) {
        setNotification({
          type: "success",
          message: `Successfully bought mGold with $${amount.toFixed(2)} USDC`,
        });
        await fetchBalances();
        await refetchTx();
      } else {
        setNotification({
          type: "error",
          message: result.error || "Transaction failed",
        });
      }
    } catch (error) {
      console.error("Buy gold error:", error);
      setNotification({
        type: "error",
        message: "Transaction failed",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle sell gold (from withdraw dialog)
  const handleSellGold = async (goldAmount: number) => {
    setIsProcessing(true);
    try {
      const result = await sellGold(goldAmount);
      if (result.success) {
        setNotification({
          type: "success",
          message: `Successfully sold ${goldAmount.toFixed(6)} mGold`,
        });
        await fetchBalances();
        await refetchTx();
      } else {
        setNotification({
          type: "error",
          message: result.error || "Transaction failed",
        });
      }
    } catch (error) {
      console.error("Sell gold error:", error);
      setNotification({
        type: "error",
        message: "Transaction failed",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle mint test USDC
  const handleMintTestUSDC = async () => {
    setIsMinting(true);
    try {
      const result = await mintTestUSDC(500); // Mint 500 test USDC
      if (result.success) {
        setNotification({
          type: "success",
          message: "Received 500 test USDC!",
        });
        await fetchBalances();
      } else {
        setNotification({
          type: "error",
          message: result.error || "Mint failed",
        });
      }
    } catch (error) {
      console.error("Mint error:", error);
      setNotification({
        type: "error",
        message: "Mint failed",
      });
    } finally {
      setIsMinting(false);
    }
  };

  // Calculate values
  const goldValueUSD = balances.gold * balances.goldPrice;
  const _totalPortfolioUSD = balances.usdc + goldValueUSD;
  const excessUSDC = Math.max(0, balances.usdc - RESERVE_THRESHOLD);

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
      case "transfer_in":
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case "sell":
      case "transfer_out":
        return <ArrowUpRight className="w-5 h-5 text-orange-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "buy":
      case "transfer_in":
        return "bg-green-100 dark:bg-green-500/20";
      case "sell":
      case "transfer_out":
        return "bg-orange-100 dark:bg-orange-500/20";
      default:
        return "bg-amber-100 dark:bg-amber-500/20";
    }
  };

  return (
    <MobileLayout activeTab="home">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          {notification.type === "success" && (
            <CheckCircle2 className="w-5 h-5" />
          )}
          {notification.type === "error" && <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium flex-1">{notification.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back 👋</p>
            <h1 className="text-xl font-bold text-foreground">
              {user?.email?.address?.split("@")[0] || "User"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchBalances();
                refetchTx();
              }}
              disabled={contractLoading}
              className="p-2.5 rounded-xl bg-muted hover:bg-secondary transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 text-foreground ${contractLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button className="p-2.5 rounded-xl bg-muted hover:bg-secondary transition-colors relative">
              <Bell className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="p-2.5 rounded-xl bg-muted hover:bg-secondary transition-colors"
            >
              <Settings className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Wallet Card */}
        <WalletCard
          balance={balances.usdc}
          goldBalance={balances.gold}
          goldPriceUSD={balances.goldPrice}
          walletAddress={walletAddress}
          variant="gold"
        />
      </div>

      <div className="px-4 space-y-6 animate-fade-in">
        {/* Error Display */}
        {contractError && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{contractError}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <QuickActions
            onDeposit={() => setShowDepositDialog(true)}
            onWithdraw={() => setShowWithdrawDialog(true)}
          />
        </div>

        {/* Auto-DCA Status Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                autoDCAStatus === "converting"
                  ? "bg-blue-100 dark:bg-blue-500/20"
                  : autoDCAStatus === "done"
                    ? "bg-green-100 dark:bg-green-500/20"
                    : "bg-amber-100 dark:bg-amber-500/20"
              }`}
            >
              <Coins
                className={`w-5 h-5 ${
                  autoDCAStatus === "converting"
                    ? "text-blue-500 animate-pulse"
                    : autoDCAStatus === "done"
                      ? "text-green-500"
                      : "text-amber-500"
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Auto Gold Savings
                </h3>
                <button
                  onClick={() => setAutoDCAEnabled(!autoDCAEnabled)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${autoDCAEnabled ? "bg-primary" : "bg-muted"}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoDCAEnabled ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {autoDCAEnabled
                  ? `Keep $${RESERVE_THRESHOLD} USDC liquid, convert rest to Gold`
                  : "Auto-conversion is disabled"}
              </p>
              {excessUSDC > 0 && autoDCAEnabled && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    ${excessUSDC.toFixed(2)} USDC available to convert
                  </p>
                  <Button
                    onClick={runAutoDCA}
                    disabled={autoDCAStatus === "converting" || isProcessing}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {autoDCAStatus === "converting" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Convert to Gold Now
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">mGold Balance</p>
            <p className="text-xl font-bold text-foreground">
              {balances.gold.toFixed(6)}
            </p>
            <p className="text-sm text-green-500">
              ≈ ${goldValueUSD.toFixed(2)}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">USDC Balance</p>
            <p className="text-xl font-bold text-foreground">
              ${balances.usdc.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Liquid cash</p>
          </div>
        </div>

        {/* Gold Price Card */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Gold Price (XAU/USD)
                </p>
                <p className="text-xl font-bold text-foreground">
                  ${balances.goldPrice.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /oz
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-500 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* Faucet Card (Testnet Only) */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Testnet Faucet</p>
                <p className="text-xs text-muted-foreground">
                  Get free test USDC
                </p>
              </div>
            </div>
            <Button
              onClick={handleMintTestUSDC}
              disabled={isMinting || !isConnected}
              size="sm"
              variant="outline"
            >
              {isMinting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Get 500 USDC"
              )}
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <button
              onClick={() => router.push("/dashboard/history")}
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              See All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-border">
            {txLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              </div>
            ) : transactions.length > 0 ? (
              transactions.slice(0, 4).map((tx) => {
                const { time } = formatTransactionDate(tx.timestamp);
                return (
                  <div key={tx.id} className="p-4 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTransactionColor(tx.type)}`}
                    >
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {tx.description}
                      </p>
                      <p className="text-sm text-muted-foreground">{time}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${tx.type === "buy" || tx.type === "transfer_in" ? "text-green-500" : "text-foreground"}`}
                      >
                        {tx.type === "buy" ? "+" : "-"}
                        {tx.goldAmount?.toFixed(4)} mGold
                      </p>
                      <a
                        href={`https://explorer.sepolia.mantle.xyz/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 justify-end"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  No transactions yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Buy gold to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contract Info (Debug) */}
        <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Network: Mantle Sepolia</p>
          <p className="font-mono truncate">
            Pool: {contractAddresses.AUREO_POOL}
          </p>
          <p className="font-mono truncate">
            Wallet: {walletAddress || "Not connected"}
          </p>
        </div>
      </div>

      {/* Deposit Dialog */}
      <DepositDialog
        onDeposit={handleBuyGold}
        usdcBalance={balances.usdc}
        isLoading={isProcessing}
      >
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
        goldBalance={balances.gold}
        goldPriceUSD={balances.goldPrice}
        onWithdraw={handleSellGold}
        isLoading={isProcessing}
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
