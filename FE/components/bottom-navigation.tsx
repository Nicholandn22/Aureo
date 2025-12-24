'use client';

import { useRouter } from 'next/navigation';
import { Home, Clock, CreditCard, User, Scan } from 'lucide-react';

interface BottomNavigationProps {
    activeTab: 'home' | 'history' | 'pay' | 'cards' | 'profile';
}

export function BottomNavigation({ activeTab }: BottomNavigationProps) {
    const router = useRouter();

    const navItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
        { id: 'history', label: 'History', icon: Clock, path: '/dashboard/history' },
        { id: 'pay', label: 'Pay', icon: Scan, path: '/dashboard/pay' },
        { id: 'cards', label: 'Cards', icon: CreditCard, path: '/dashboard/cards' },
        { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' },
    ];

    const handleNavClick = (path: string, id: string) => {
        if (id === 'pay') {
            router.push('/dashboard/pay');
        } else {
            router.push(path);
        }
    };

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isCenter = item.id === 'pay';
                const isActive = activeTab === item.id;

                if (isCenter) {
                    return (
                        <div key={item.id} className="pay-button-container">
                            <button
                                onClick={() => handleNavClick(item.path, item.id)}
                                className="pay-button"
                                aria-label="Pay"
                            >
                                <Icon strokeWidth={2.5} />
                            </button>
                            <span className="nav-label text-center block mt-2">{item.label}</span>
                        </div>
                    );
                }

                return (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item.path, item.id)}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        aria-label={item.label}
                    >
                        <Icon className="nav-icon" strokeWidth={isActive ? 2.5 : 2} />
                        <span className="nav-label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
