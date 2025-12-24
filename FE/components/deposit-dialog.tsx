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
import { Sparkles, Wallet, Loader2 } from 'lucide-react';

interface DepositDialogProps {
  children: React.ReactNode;
  onDeposit: (amount: number) => void;
}

export function DepositDialog({ children, onDeposit }: DepositDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickAmounts = [25, 50, 100, 250];

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0) {
      setIsProcessing(true);
      setTimeout(() => {
        onDeposit(depositAmount);
        setIsProcessing(false);
        setOpen(false);
        setAmount('');
      }, 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl border-border bg-card">
        <DialogHeader className="text-left">
          <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-4">
            <Wallet className="w-7 h-7 text-green-500" />
          </div>
          <DialogTitle className="text-xl">Top Up</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Add USDC to your wallet. Our AI will automatically convert to gold at the best price.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (USDC)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 py-6 text-2xl font-semibold rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick select</label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quick) => (
                <Button
                  key={quick}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quick.toString())}
                  className={`font-medium rounded-xl py-5 ${amount === quick.toString()
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                    }`}
                >
                  ${quick}
                </Button>
              ))}
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">AI Will Optimize</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Your ${parseFloat(amount).toFixed(2)} will be converted to gold at the optimal price point.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setAmount('');
            }}
            disabled={isProcessing}
            className="w-full sm:w-auto rounded-xl py-5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl py-5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Top Up Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
