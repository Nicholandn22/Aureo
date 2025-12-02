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
import { TrendingUp, AlertCircle } from 'lucide-react';

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

  const idrxAmount = parseFloat(grams) * goldPriceIDR;
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
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-gray-300/50 dark:border-gray-600/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-foreground/70" />
            </span>
            Withdraw to IDRX
          </DialogTitle>
          <DialogDescription>
            Convert your gold balance to IDRX. Instant conversion at current market price.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-secondary rounded-lg p-3 space-y-1">
            <div className="text-sm text-muted-foreground">Available Balance</div>
            <div className="text-xl font-bold">{goldBalance.toFixed(3)} g</div>
            <div className="text-sm text-muted-foreground">
              ≈ Rp {(goldBalance * goldPriceIDR).toLocaleString('id-ID')}
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
                className="pr-10 text-lg"
                step="0.001"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                  className="font-normal"
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>

          {grams && parseFloat(grams) > 0 && (
            <>
              <div className="bg-secondary rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gold to withdraw</span>
                  <span className="font-medium">{parseFloat(grams).toFixed(3)} g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current price</span>
                  <span className="font-medium">Rp {goldPriceIDR.toLocaleString('id-ID')}/g</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">You will receive</span>
                    <span className="font-bold text-lg text-foreground">
                      Rp {idrxAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {!isValidAmount && parseFloat(grams) > goldBalance && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-destructive">Insufficient Balance</p>
                    <p className="text-muted-foreground">
                      You only have {goldBalance.toFixed(3)} grams available.
                    </p>
                  </div>
                </div>
              )}

              {isValidAmount && (
                <div className="bg-accent/50 dark:bg-accent/30 border border-border rounded-lg p-3 flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-foreground/70 mt-0.5 shrink-0" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">Instant Conversion</p>
                    <p className="text-muted-foreground">
                      Your gold will be instantly converted to IDRX at the current market rate.
                    </p>
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
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={!isValidAmount || isProcessing}
            className="w-full sm:w-auto bg-foreground hover:bg-foreground/90 text-background"
          >
            {isProcessing ? 'Processing...' : 'Withdraw Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
