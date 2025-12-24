'use client';

import { ArrowUpRight, Plus, Send, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    path?: string;
    onClick?: () => void;
}

interface QuickActionsProps {
    onDeposit?: () => void;
    onWithdraw?: () => void;
    onSend?: () => void;
}

export function QuickActions({ onDeposit, onWithdraw, onSend }: QuickActionsProps) {
    const router = useRouter();

    const actions: QuickAction[] = [
        {
            id: 'deposit',
            label: 'Top Up',
            icon: Plus,
            color: '#10B981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
            onClick: onDeposit,
        },
        {
            id: 'send',
            label: 'Send',
            icon: Send,
            color: '#0066FF',
            bgColor: 'rgba(0, 102, 255, 0.1)',
            onClick: onSend || (() => router.push('/dashboard/pay?mode=send')),
        },
        {
            id: 'scan',
            label: 'Scan',
            icon: QrCode,
            color: '#8B5CF6',
            bgColor: 'rgba(139, 92, 246, 0.1)',
            path: '/dashboard/pay',
        },
        {
            id: 'withdraw',
            label: 'Withdraw',
            icon: ArrowUpRight,
            color: '#F59E0B',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            onClick: onWithdraw,
        },
    ];

    const handleClick = (action: QuickAction) => {
        if (action.onClick) {
            action.onClick();
        } else if (action.path) {
            router.push(action.path);
        }
    };

    return (
        <div className="quick-actions">
            {actions.map((action) => {
                const Icon = action.icon;
                return (
                    <button
                        key={action.id}
                        onClick={() => handleClick(action)}
                        className="quick-action-item"
                    >
                        <div
                            className="quick-action-icon"
                            style={{ backgroundColor: action.bgColor }}
                        >
                            <Icon
                                className="w-5 h-5"
                                style={{ color: action.color }}
                                strokeWidth={2}
                            />
                        </div>
                        <span className="quick-action-label">{action.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
