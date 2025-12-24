'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    QrCode,
    Send,
    Camera,
    X,
    Wallet,
    Copy,
    Check,
    AlertCircle,
    Loader2,
    ChevronRight
} from 'lucide-react';

type PayMode = 'scan' | 'send';

export default function PayPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, ready, authenticated } = usePrivy();

    const [mode, setMode] = useState<PayMode>((searchParams.get('mode') as PayMode) || 'scan');
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/');
        }
    }, [ready, authenticated, router]);

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startScanning = async () => {
        setIsScanning(true);
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch {
            setError('Unable to access camera. Please grant camera permissions.');
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    const handleSend = async () => {
        if (!recipientAddress || !amount) {
            setError('Please enter recipient address and amount');
            return;
        }

        // Validate EVM address
        if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            setError('Invalid EVM wallet address');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setIsSending(true);
        setError('');

        try {
            // Simulate transaction - replace with actual USDC transfer logic
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Navigate to success page or show success state
            router.push(`/dashboard/pay/success?amount=${amount}&to=${recipientAddress}`);
        } catch {
            setError('Transaction failed. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const copyAddress = async () => {
        if (user?.wallet?.address) {
            await navigator.clipboard.writeText(user.wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const quickAmounts = [10, 25, 50, 100];

    if (!ready || !authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <MobileLayout activeTab="pay" showNav={!isScanning}>
            {/* QR Scanner Overlay */}
            {isScanning && (
                <div className="qr-overlay flex flex-col">
                    <div className="flex items-center justify-between p-4">
                        <button onClick={stopScanning} className="p-2 rounded-full bg-white/10">
                            <X className="w-6 h-6 text-white" />
                        </button>
                        <span className="text-white font-medium">Scan QR Code</span>
                        <div className="w-10" />
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-72 h-72 rounded-3xl object-cover"
                            />
                            <div className="absolute inset-0 qr-scanner-box">
                                <div className="scan-line" />
                            </div>

                            {/* Corner decorations */}
                            <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10 border-l-4 border-b-4 border-primary rounded-bl-xl" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10 border-r-4 border-b-4 border-primary rounded-br-xl" />
                        </div>
                    </div>

                    <div className="p-6 text-center">
                        <p className="text-white/70 text-sm">
                            Position the QR code within the frame to scan
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-b from-primary to-primary/90 text-white px-4 pt-12 pb-8 rounded-b-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-semibold">Pay</h1>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 bg-white/10 rounded-2xl p-1">
                    <button
                        onClick={() => setMode('scan')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${mode === 'scan'
                            ? 'bg-white text-primary'
                            : 'text-white/80 hover:text-white'
                            }`}
                    >
                        <QrCode className="w-5 h-5" />
                        Scan QR
                    </button>
                    <button
                        onClick={() => setMode('send')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${mode === 'send'
                            ? 'bg-white text-primary'
                            : 'text-white/80 hover:text-white'
                            }`}
                    >
                        <Send className="w-5 h-5" />
                        Transfer
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6 animate-fade-in">
                {mode === 'scan' ? (
                    <>
                        {/* Scan QR Mode */}
                        <div className="bg-card rounded-2xl p-6 border border-border">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Camera className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Scan to Pay</h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Scan any EVM wallet QR code to send USDC instantly
                                    </p>
                                </div>
                                <Button
                                    onClick={startScanning}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-base rounded-xl"
                                >
                                    <Camera className="w-5 h-5 mr-2" />
                                    Open Scanner
                                </Button>
                            </div>
                        </div>

                        {/* My QR Code */}
                        <div className="bg-card rounded-2xl p-6 border border-border">
                            <h3 className="font-semibold mb-4">Receive Payment</h3>
                            <div className="bg-muted rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Your Address</p>
                                        <p className="font-mono text-sm mt-1">
                                            {user?.wallet?.address
                                                ? `${user.wallet.address.slice(0, 10)}...${user.wallet.address.slice(-8)}`
                                                : 'Not connected'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={copyAddress}
                                        className="p-3 rounded-xl bg-background hover:bg-secondary transition-colors"
                                    >
                                        {copied ? (
                                            <Check className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Transfer Mode */}
                        <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
                            {/* Recipient Address */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Recipient Address</label>
                                <div className="relative">
                                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        value={recipientAddress}
                                        onChange={(e) => {
                                            setRecipientAddress(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="0x..."
                                        className="pl-12 py-6 text-base rounded-xl font-mono"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Paste or scan any EVM wallet address
                                </p>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount (USDC)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                                        $
                                    </span>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="0.00"
                                        className="pl-10 py-6 text-2xl font-semibold rounded-xl"
                                    />
                                </div>

                                {/* Quick Amounts */}
                                <div className="flex gap-2 pt-2">
                                    {quickAmounts.map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setAmount(amt.toString())}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${amount === amt.toString()
                                                ? 'bg-primary text-white'
                                                : 'bg-muted hover:bg-secondary text-foreground'
                                                }`}
                                        >
                                            ${amt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-500/10 p-3 rounded-xl">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Send Button */}
                            <Button
                                onClick={handleSend}
                                disabled={isSending || !amount || !recipientAddress}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-base rounded-xl disabled:opacity-50"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Send USDC
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Recent Recipients */}
                        <div className="bg-card rounded-2xl p-4 border border-border">
                            <h3 className="font-semibold mb-3 px-2">Recent</h3>
                            <div className="space-y-1">
                                {[
                                    { address: '0x742d...Fa89', name: 'Alice' },
                                    { address: '0x8912...1234', name: 'Bob' },
                                ].map((recipient, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setRecipientAddress(recipient.address)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-medium">
                                                {recipient.name[0]}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium">{recipient.name}</p>
                                                <p className="text-sm text-muted-foreground font-mono">
                                                    {recipient.address}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MobileLayout>
    );
}
