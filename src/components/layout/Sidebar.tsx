
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Target, Settings, DollarSign, TrendingUp, BookOpen } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';

export function Sidebar() {
    const { startGuide, settings } = useStore();
    const { t } = useTranslation();

    const navItems = [
        { icon: LayoutDashboard, label: t.dashboard.title, path: '/' },
        { icon: Wallet, label: t.transactions.title, path: '/transactions' },
        { icon: PieChart, label: t.assets.equity, path: '/assets/equity' },
        { icon: TrendingUp, label: t.investments.title, path: '/investments' },
        { icon: DollarSign, label: t.assets.liabilities, path: '/assets/liability' },
        { icon: Target, label: t.budgets.title, path: '/budgets' },
        { icon: Settings, label: t.settings.title, path: '/settings' },
    ];

    return (
        <aside className="hidden h-screen w-64 flex-col border-r bg-card text-card-foreground md:flex">
            <div className="flex h-14 items-center border-b px-4">
                <span className="text-lg font-bold text-primary">{settings.appName || t.app.title}</span>
            </div>
            <nav className="flex-1 space-y-1 p-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"
                            )
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t space-y-2">
                <button
                    onClick={() => startGuide('main-tour')}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-primary"
                >
                    <BookOpen className="h-4 w-4" />
                    Guide Mode
                </button>
                <p className="text-xs text-muted-foreground text-center pt-2 border-t">v0.1.0 Beta</p>
            </div>
        </aside>
    );
}
