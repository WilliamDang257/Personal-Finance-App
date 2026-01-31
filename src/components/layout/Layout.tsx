import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useStore } from '../../hooks/useStore';
import { ChatbotWidget } from '../../features/chatbot/ChatbotWidget';
import { GuideTour, type GuideStep } from '../guide/GuideTour';

const TOUR_STEPS: GuideStep[] = [
    {
        target: 'aside',
        title: 'Welcome to Personal Wealth',
        content: 'This is your financial command center. Use the sidebar to navigate between different modules.',
        position: 'right',
        path: '/'
    },
    {
        target: 'a[href="/"]',
        title: 'Dashboard',
        content: 'Get a high-level overview of your Net Worth, Cash Flow, and recent activity.',
        position: 'right',
        path: '/'
    },
    {
        target: 'a[href="/transactions"]',
        title: 'Transactions',
        content: 'Track every penny. Log income and expenses, and filter by category or date.',
        position: 'right',
        path: '/transactions'
    },
    {
        target: 'a[href="/investments"]',
        title: 'Investment Portfolio',
        content: 'Monitor your stocks, crypto, and other assets. Track profit/loss and performance over time.',
        position: 'right',
        path: '/investments'
    },
    {
        target: 'a[href="/assets/equity"]',
        title: 'Cash & Assets',
        content: 'Manage your liquid assets like Cash, Savings, and Receivables.',
        position: 'right',
        path: '/assets/equity'
    },
    {
        target: 'a[href="/budgets"]',
        title: 'Smart Budgeting',
        content: 'Set monthly or yearly limits for your spending categories to stay on track.',
        position: 'right',
        path: '/budgets'
    },
    {
        target: 'a[href="/settings"]',
        title: 'Settings & Data',
        content: 'Configure your currency, theme, and manage your data (Import/Export/Demo Mode).',
        position: 'right',
        path: '/settings'
    },
    {
        target: '#security-settings',
        title: 'Security',
        content: 'Keep your data safe! Enable PIN protection here to prevent unauthorized access.',
        position: 'top',
        path: '/settings'
    }
];

export function Layout() {
    const { settings } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'pink', 'red');
        if (settings.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(settings.theme);
        }
    }, [settings.theme]);

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar (Drawer) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <Sidebar
                        className="relative z-50 flex h-full w-64 flex-col border-r bg-card shadow-xl animate-in slide-in-from-left duration-300"
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            )}

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto bg-muted/20">
                    <Outlet />
                </main>
            </div>
            <ChatbotWidget />
            <GuideTour steps={TOUR_STEPS} />
        </div>
    );
}
