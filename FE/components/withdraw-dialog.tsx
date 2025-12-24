'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

interface WithdrawDialogProps {
  children: React.ReactNode;
  goldBalance: number;
  goldPriceIDR: number;
  onWithdraw: (grams: number) => void;
}

export function WithdrawDialog({ children, goldBalance, goldPriceIDR, onWithdraw }: WithdrawDialogProps) {
  const [open, setOpen] = useState(false);
  const [grams, setGrams] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert IDR to USD (approximate)
  const goldPriceUSD = goldPriceIDR / 15000;
  const usdcAmount = parseFloat(grams) * goldPriceUSD;
  const isValidAmount = parseFloat(grams) > 0 && parseFloat(grams) <= goldBalance;

  const quickPercentages = [25, 50, 75, 100];

  const handleWithdraw = () => {
    const withdrawGrams = parseFloat(grams);
    if (isValidAmount) {
      setIsProcessing(true);
      setTimeout(() => {
        onWithdraw(withdrawGrams);
        setIsProcessing(false);
        setOpen(false);
        setGrams('');
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl border-border bg-card">
        <DialogHeader className="text-left">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-7 h-7 text-amber-500" />
          </div>
          <DialogTitle className="text-xl">Withdraw</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Convert your gold balance to USDC instantly at current market price.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="bg-muted rounded-2xl p-4">
            <div className="text-sm text-muted-foreground">Available Balance</div>
            <div className="text-2xl font-bold mt-1">{goldBalance.toFixed(3)} g</div>
            <div className="text-sm text-muted-foreground mt-1">
              ≈ ${(goldBalance * goldPriceUSD).toFixed(2)} USDC
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (Grams)</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.000"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className="pr-10 py-6 text-2xl font-semibold rounded-xl"
                step="0.001"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                g
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick select</label>
            <div className="grid grid-cols-4 gap-2">
              {quickPercentages.map((pct) => (
                <Button
                  key={pct}
                  variant="outline"
                  size="sm"
                  onClick={() => setGrams(((goldBalance * pct) / 100).toFixed(3))}
                  className={`font-medium rounded-xl py-5 ${grams === ((goldBalance * pct) / 100).toFixed(3)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                    }`}
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>

          {grams && parseFloat(grams) > 0 && (
            <>
              <div className="bg-muted rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gold to withdraw</span>
                  <span className="font-medium">{parseFloat(grams).toFixed(3)} g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current price</span>
                  <span className="font-medium">${goldPriceUSD.toFixed(2)}/g</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">You will receive</span>
                    <span className="font-bold text-xl text-green-500">
                      ${usdcAmount.toFixed(2)} USDC
                    </span>
                  </div>
                </div>
              </div>

              {!isValidAmount && parseFloat(grams) > goldBalance && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-500/10 p-4 rounded-xl">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-medium">Insufficient Balance</p>
                    <p className="text-red-400">You only have {goldBalance.toFixed(3)} grams.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setGrams('');
            }}
            disabled={isProcessing}
            className="w-full sm:w-auto rounded-xl py-5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={!isValidAmount || isProcessing}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Withdraw Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
