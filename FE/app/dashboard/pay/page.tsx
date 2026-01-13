'use client';

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAureoContract } from '@/lib/hooks/useAureoContract';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/services/contractService';
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
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

type PayMode = 'scan' | 'send';

interface RecentRecipient {
    address: string;
    name?: string;
    lastUsed: Date;
}

function PayPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, ready, authenticated } = usePrivy();
    const { wallets } = useWallets();
    const { balances, fetchBalances } = useAureoContract();

    const [mode, setMode] = useState<PayMode>((searchParams.get('mode') as PayMode) || 'send');
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>([]);
    const [scanSuccess, setScanSuccess] = useState(false);

    const streamRef = useRef<MediaStream | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Load recent recipients from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('aureo_recent_recipients');
        if (saved) {
            try {
                setRecentRecipients(JSON.parse(saved));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

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

    // Extract EVM address from scanned text
    const extractEvmAddress = useCallback((text: string): string | null => {
        // Direct address format (0x...)
        const directMatch = text.match(/^(0x[a-fA-F0-9]{40})$/);
        if (directMatch) return directMatch[1];

        // Ethereum URI format (ethereum:0x...)
        const ethUriMatch = text.match(/ethereum:(0x[a-fA-F0-9]{40})/i);
        if (ethUriMatch) return ethUriMatch[1];

        // EIP-681 format (ethereum:0x...@chainId)
        const eip681Match = text.match(/ethereum:(0x[a-fA-F0-9]{40})@/i);
        if (eip681Match) return eip681Match[1];

        // Search for any valid address in the text
        const anyAddressMatch = text.match(/0x[a-fA-F0-9]{40}/);
        if (anyAddressMatch) return anyAddressMatch[0];

        return null;
    }, []);

    // Handle successful QR scan
    const onScanSuccess = useCallback((decodedText: string) => {
        console.log('QR Scanned:', decodedText);
        const address = extractEvmAddress(decodedText);
        
        if (address && ethers.isAddress(address)) {
            setRecipientAddress(address);
            setScanSuccess(true);
            setError('');
            
            // Stop scanner and switch to send mode
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
            setIsScanning(false);
            setMode('send');
            
            // Reset success state after animation
            setTimeout(() => setScanSuccess(false), 2000);
        } else {
            setError('Invalid wallet address in QR code');
        }
    }, [extractEvmAddress]);

    const startScanning = useCallback(async () => {
        setIsScanning(true);
        setError('');
        setScanSuccess(false);
        
        // Wait for DOM to render
        setTimeout(() => {
            try {
                const scanner = new Html5QrcodeScanner(
                    'qr-reader',
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1,
                        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                        rememberLastUsedCamera: true,
                    },
                    /* verbose= */ false
                );
                
                scanner.render(
                    (decodedText) => onScanSuccess(decodedText),
                    (errorMessage) => {
                        // Ignore scan failures (expected while scanning)
                        if (!errorMessage.includes('No MultiFormat Readers')) {
                            console.debug('QR scan error:', errorMessage);
                        }
                    }
                );
                
                scannerRef.current = scanner;
            } catch (err) {
                console.error('Failed to start scanner:', err);
                setError('Unable to start camera. Please grant camera permissions.');
                setIsScanning(false);
            }
        }, 100);
    }, [onScanSuccess]);

    const stopScanning = useCallback(() => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    }, []);

    const saveRecentRecipient = (address: string) => {
        const existing = recentRecipients.filter(r => r.address.toLowerCase() !== address.toLowerCase());
        const updated: RecentRecipient[] = [
            { address, lastUsed: new Date() },
            ...existing.slice(0, 4) // Keep only 5 recent
        ];
        setRecentRecipients(updated);
        localStorage.setItem('aureo_recent_recipients', JSON.stringify(updated));
    };

    const handleSend = async () => {
        if (!recipientAddress || !amount) {
            setError('Please enter recipient address and amount');
            return;
        }

        // Validate EVM address
        if (!ethers.isAddress(recipientAddress)) {
            setError('Invalid EVM wallet address');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (numAmount > balances.usdc) {
            setError(`Insufficient balance. You have $${balances.usdc.toFixed(2)} USDC`);
            return;
        }

        // Don't allow sending to self
        if (recipientAddress.toLowerCase() === user?.wallet?.address?.toLowerCase()) {
            setError('Cannot send to your own address');
            return;
        }

        setIsSending(true);
        setError('');
        setTxHash(null);

        try {
            // Get the active wallet
            const activeWallet = wallets.find(w => w.walletClientType === 'privy') || wallets[0];
            if (!activeWallet) {
                throw new Error('No wallet connected');
            }

            // Get the ethereum provider from Privy wallet
            const provider = await activeWallet.getEthereumProvider();
            const ethersProvider = new ethers.BrowserProvider(provider);
            const signer = await ethersProvider.getSigner();

            // Create USDC contract instance
            const usdcContract = new ethers.Contract(
                CONTRACT_ADDRESSES.M_USDC,
                CONTRACT_ABIS.M_USDC,
                signer
            );

            // Get decimals and parse amount
            const decimals = await usdcContract.decimals();
            const amountInWei = ethers.parseUnits(numAmount.toString(), decimals);

            // Execute transfer
            console.log(`Sending ${numAmount} USDC to ${recipientAddress}...`);
            const tx = await usdcContract.transfer(recipientAddress, amountInWei);
            console.log('Transaction sent:', tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.hash);

            setTxHash(receipt.hash);
            saveRecentRecipient(recipientAddress);

            // Refresh balances
            await fetchBalances();

            // Navigate to success page
            router.push(`/dashboard/pay/success?amount=${amount}&to=${recipientAddress}&tx=${receipt.hash}`);
        } catch (err: unknown) {
            console.error('Transfer error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
            if (errorMessage.includes('user rejected')) {
                setError('Transaction was rejected');
            } else if (errorMessage.includes('insufficient')) {
                setError('Insufficient balance for transaction');
            } else {
                setError('Transaction failed. Please try again.');
            }
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
                <div className="fixed inset-0 z-50 bg-black flex flex-col">
                    <div className="flex items-center justify-between p-4 bg-black/80">
                        <button onClick={stopScanning} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <X className="w-6 h-6 text-white" />
                        </button>
                        <span className="text-white font-medium">Scan Wallet QR Code</span>
                        <div className="w-10" />
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        {/* Html5-qrcode container */}
                        <div 
                            id="qr-reader" 
                            className="w-full max-w-sm rounded-3xl overflow-hidden"
                            style={{ 
                                background: '#000',
                            }}
                        />
                        
                        {/* Success indicator */}
                        {scanSuccess && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                <div className="bg-green-500 rounded-full p-6 animate-bounce">
                                    <Check className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 text-center bg-black/80">
                        <p className="text-white/70 text-sm">
                            Scan any EVM wallet QR code to auto-fill the address
                        </p>
                        <p className="text-white/50 text-xs mt-2">
                            Supports: Plain address, ethereum: URI, MetaMask, Coinbase, etc.
                        </p>
                        
                        {error && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
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

                {/* Balance Display */}
                <div className="bg-white/10 rounded-2xl p-4 mb-4">
                    <p className="text-white/70 text-sm">Available USDC</p>
                    <p className="text-3xl font-bold">${balances.usdc.toFixed(2)}</p>
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
                                        disabled={isSending}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Enter any EVM wallet address (Mantle Sepolia)
                                </p>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Amount (USDC)</label>
                                    <span className="text-xs text-muted-foreground">
                                        Balance: ${balances.usdc.toFixed(2)}
                                    </span>
                                </div>
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
                                        disabled={isSending}
                                    />
                                </div>

                                {/* Quick Amounts */}
                                <div className="flex gap-2 pt-2">
                                    {quickAmounts.map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setAmount(amt.toString())}
                                            disabled={amt > balances.usdc || isSending}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${amount === amt.toString()
                                                ? 'bg-primary text-white'
                                                : 'bg-muted hover:bg-secondary text-foreground'
                                                } ${amt > balances.usdc ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                            {/* Transaction Hash */}
                            {txHash && (
                                <div className="flex items-center gap-2 text-green-500 text-sm bg-green-50 dark:bg-green-500/10 p-3 rounded-xl">
                                    <Check className="w-4 h-4 shrink-0" />
                                    <span>Sent!</span>
                                    <a
                                        href={`https://explorer.sepolia.mantle.xyz/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 underline"
                                    >
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
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
                        {recentRecipients.length > 0 && (
                            <div className="bg-card rounded-2xl p-4 border border-border">
                                <h3 className="font-semibold mb-3 px-2">Recent</h3>
                                <div className="space-y-1">
                                    {recentRecipients.map((recipient, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setRecipientAddress(recipient.address)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-medium">
                                                    {recipient.address.slice(2, 4).toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-mono text-sm">
                                                        {recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Network Info */}
                        <div className="bg-muted/50 rounded-xl p-3 text-center text-xs text-muted-foreground">
                            Sending on <span className="font-medium">Mantle Sepolia Testnet</span>
                        </div>
                    </>
                )}
            </div>
        </MobileLayout>
    );
}

// Wrap with Suspense for useSearchParams SSR compatibility
export default function PayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <PayPageContent />
        </Suspense>
    );
}
