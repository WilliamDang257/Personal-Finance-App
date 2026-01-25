
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Target, Settings, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wallet, label: 'Transactions', path: '/transactions' },
    { icon: PieChart, label: 'Equity', path: '/assets/equity' },
    { icon: DollarSign, label: 'Liabilities', path: '/assets/liability' },
    { icon: Target, label: 'Budgets', path: '/budgets' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
    return (
        <aside className="hidden h-screen w-64 flex-col border-r bg-card text-card-foreground md:flex">
            <div className="flex h-14 items-center border-b px-4">
                <span className="text-lg font-bold text-primary">Personal Wealth</span>
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
            <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground text-center">v0.1.0 Beta</p>
            </div>
        </aside>
    );
}
