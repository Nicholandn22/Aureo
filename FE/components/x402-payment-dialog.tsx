'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { X402PaymentRequirement, formatUSDCAmount } from '@/lib/x402';

interface X402PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requirement: X402PaymentRequirement | null;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
}

export function X402PaymentDialog({
    open,
    onOpenChange,
    requirement,
    onConfirm,
    onCancel,
}: X402PaymentDialogProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'signing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleConfirm = async () => {
        setIsProcessing(true);
        setStatus('signing');
        setErrorMessage('');

        try {
            await onConfirm();
            setStatus('success');
            setTimeout(() => {
                onOpenChange(false);
                setStatus('idle');
            }, 1500);
        } catch (error) {
            setStatus('error');
            setErrorMessage((error as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        setStatus('idle');
        setErrorMessage('');
        onCancel();
    };

    if (!requirement) return null;

    const amount = formatUSDCAmount(parseInt(requirement.amount));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl border-border bg-card">
                <DialogHeader className="text-left">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        {status === 'success' ? (
                            <CheckCircle className="w-7 h-7 text-green-500" />
                        ) : status === 'error' ? (
                            <AlertCircle className="w-7 h-7 text-red-500" />
                        ) : (
                            <Shield className="w-7 h-7 text-primary" />
                        )}
                    </div>
                    <DialogTitle className="text-xl">
                        {status === 'success' ? 'Payment Complete' :
                            status === 'error' ? 'Payment Failed' :
                                'Premium Service'}
                    </DialogTitle>
                    <DialogDescription className="leading-relaxed">
                        {status === 'success'
                            ? 'Your payment was successful. Processing your request...'
                            : status === 'error'
                                ? errorMessage || 'Something went wrong. Please try again.'
                                : requirement.description}
                    </DialogDescription>
                </DialogHeader>

                {status === 'idle' && (
                    <div className="py-4 space-y-4">
                        {/* x402 Badge */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-xl border border-primary/10">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">x402 Protocol Payment</span>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-muted rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Service</span>
                                <span className="font-medium">AI Smart Analysis</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Network</span>
                                <span className="font-medium">{requirement.network}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Token</span>
                                <span className="font-medium">USDC</span>
                            </div>
                            <div className="border-t border-border pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Total</span>
                                    <span className="text-xl font-bold text-primary">{amount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                            <Shield className="w-3 h-3" />
                            Secured by EIP-3009 signature authorization
                        </div>
                    </div>
                )}

                {status === 'signing' && (
                    <div className="py-8 text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="font-medium">Signing payment...</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Please confirm the signature in your wallet
                        </p>
                    </div>
                )}

                {status !== 'success' && (
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="w-full sm:w-auto rounded-xl py-5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isProcessing || status === 'error'}
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl py-5"
                        >
                            {status === 'error' ? 'Try Again' : `Pay ${amount}`}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook for managing x402 payment flow
 */
export function useX402Payment() {
    const [requirement, setRequirement] = useState<X402PaymentRequirement | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [resolvePayment, setResolvePayment] = useState<((value: boolean) => void) | null>(null);

    const requestPayment = async (req: X402PaymentRequirement): Promise<boolean> => {
        return new Promise((resolve) => {
            setRequirement(req);
            setShowDialog(true);
            setResolvePayment(() => resolve);
        });
    };

    const confirmPayment = async () => {
        if (resolvePayment) {
            resolvePayment(true);
        }
    };

    const cancelPayment = () => {
        if (resolvePayment) {
            resolvePayment(false);
        }
        setShowDialog(false);
        setRequirement(null);
    };

    const closeDialog = () => {
        setShowDialog(false);
        setRequirement(null);
        setResolvePayment(null);
    };

    return {
        requirement,
        showDialog,
        requestPayment,
        confirmPayment,
        cancelPayment,
        closeDialog,
        setShowDialog,
    };
}
