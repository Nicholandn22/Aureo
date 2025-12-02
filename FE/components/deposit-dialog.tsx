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
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-gray-300/50 dark:border-gray-600/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-foreground/70" />
            </span>
            Deposit IDRX
          </DialogTitle>
          <DialogDescription>
            Enter the amount you want to deposit. Our AI will analyze the market and buy gold at the best price.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                  className="font-normal"
                >
                  Rp {quick.toLocaleString('id-ID')}
                </Button>
              ))}
            </div>
          </div>

          {amount && parseInt(amount) > 0 && (
            <div className="bg-accent/50 dark:bg-accent/30 border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-foreground/70 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">AI Will Optimize Your Purchase</p>
                  <p className="text-muted-foreground">
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
            className="w-full sm:w-auto bg-foreground hover:bg-foreground/90 text-background"
          >
            {isProcessing ? 'Processing...' : 'Deposit Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
