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
import { Sparkles } from 'lucide-react';

interface DepositDialogProps {
  children: React.ReactNode;
  onDeposit: (amount: number) => void;
}

export function DepositDialog({ children, onDeposit }: DepositDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickAmounts = [100000, 500000, 1000000, 5000000];

  const handleDeposit = () => {
    const depositAmount = parseInt(amount);
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
      <DialogContent className="sm:max-w-md backdrop-blur-sm bg-card/95 border-border/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </span>
            Deposit IDRX
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            Enter the amount you want to deposit. Our AI will analyze the market and buy gold at the best price.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (IDR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                Rp
              </span>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick amounts</label>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((quick) => (
                <Button
                  key={quick}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quick.toString())}
                  className="font-normal border-border/60 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                >
                  Rp {quick.toLocaleString('id-ID')}
                </Button>
              ))}
            </div>
          </div>

          {amount && parseInt(amount) > 0 && (
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">AI Will Optimize Your Purchase</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Your funds will be held securely while our AI monitors gold prices. When it detects the optimal entry point, it will automatically execute the purchase.
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
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={!amount || parseInt(amount) <= 0 || isProcessing}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20"
          >
            {isProcessing ? 'Processing...' : 'Deposit Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
