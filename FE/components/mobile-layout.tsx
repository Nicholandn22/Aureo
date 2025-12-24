'use client';

import { ReactNode } from 'react';
import { BottomNavigation } from './bottom-navigation';

interface MobileLayoutProps {
    children: ReactNode;
    activeTab?: 'home' | 'history' | 'pay' | 'cards' | 'profile';
    showNav?: boolean;
}

export function MobileLayout({ children, activeTab = 'home', showNav = true }: MobileLayoutProps) {
    return (
        <div className="mobile-container bg-background">
            <main className="pb-24">
                {children}
            </main>
            {showNav && <BottomNavigation activeTab={activeTab} />}
        </div>
    );
}
