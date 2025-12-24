'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { MobileLayout } from '@/components/mobile-layout';
import {
    ArrowLeft,
    Shield,
    Bell,
    HelpCircle,
    LogOut,
    ChevronRight,
    Copy,
    Check,
    Moon,
    Sun,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const router = useRouter();
    const { ready, authenticated, user, logout } = usePrivy();
    const [copied, setCopied] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/');
        }
    }, [ready, authenticated, router]);



    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        document.documentElement.classList.toggle('dark', newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const copyAddress = async () => {
        if (user?.wallet?.address) {
            await navigator.clipboard.writeText(user.wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (!ready || !authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const menuItems = [
        {
            id: 'security',
            icon: Shield,
            label: 'Security',
            description: 'Password & 2FA',
            color: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-500/20',
        },
        {
            id: 'notifications',
            icon: Bell,
            label: 'Notifications',
            description: 'Push & email alerts',
            color: 'text-amber-500',
            bgColor: 'bg-amber-100 dark:bg-amber-500/20',
        },
        {
            id: 'help',
            icon: HelpCircle,
            label: 'Help & Support',
            description: 'FAQ & contact us',
            color: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-500/20',
        },
    ];

    return (
        <MobileLayout activeTab="profile">
            {/* Header */}
            <div className="bg-gradient-to-b from-primary/10 to-background px-4 pt-12 pb-8">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 rounded-full bg-muted hover:bg-secondary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-semibold">Profile</h1>
                </div>

                {/* Profile Card */}
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                            {user?.email?.address?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-lg">
                                {user?.email?.address?.split('@')[0] || 'User'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {user?.email?.address || 'No email'}
                            </p>
                        </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="bg-muted rounded-xl p-4">
                        <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-sm">
                                {user?.wallet?.address
                                    ? `${user.wallet.address.slice(0, 10)}...${user.wallet.address.slice(-8)}`
                                    : 'Not connected'}
                            </p>
                            <button
                                onClick={copyAddress}
                                className="p-2 rounded-lg bg-background hover:bg-secondary transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Theme Toggle */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-amber-100'
                                }`}>
                                {isDarkMode ? (
                                    <Moon className="w-5 h-5 text-indigo-500" />
                                ) : (
                                    <Sun className="w-5 h-5 text-amber-500" />
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-medium">Appearance</p>
                                <p className="text-sm text-muted-foreground">
                                    {isDarkMode ? 'Dark mode' : 'Light mode'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-12 h-7 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-muted'
                            }`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                        </div>
                    </button>
                </div>

                {/* Menu Items */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.bgColor}`}>
                                        <Icon className={`w-5 h-5 ${item.color}`} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">{item.label}</p>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </button>
                        );
                    })}
                </div>

                {/* Explorer Link */}
                <a
                    href={`https://explorer.sepolia.mantle.xyz/address/${user?.wallet?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-muted transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-500/20">
                            <ExternalLink className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="font-medium">View on Explorer</p>
                            <p className="text-sm text-muted-foreground">Mantle Sepolia</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </a>

                {/* Logout Button */}
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full py-6 rounded-2xl border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Log Out
                </Button>

                {/* Version */}
                <p className="text-center text-sm text-muted-foreground py-4">
                    AUREO v1.0.0 • Built for Hackathon 2024
                </p>
            </div>
        </MobileLayout>
    );
}
