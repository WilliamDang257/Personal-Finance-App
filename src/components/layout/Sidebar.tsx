import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Target, Settings, DollarSign, TrendingUp, BookOpen, ChevronDown, ChevronRight, Briefcase, Bell } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
    const { startGuide, settings } = useStore();
    const { t } = useTranslation();
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>(['my-assets']);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleLinkClick = () => {
        if (onClose) {
            onClose();
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: t.dashboard.title, path: '/' },
        { icon: Wallet, label: t.transactions.title, path: '/transactions' },
        {
            id: 'my-assets',
            icon: Briefcase,
            label: 'My Asset',
            path: '#',
            children: [
                { icon: PieChart, label: t.assets.equity, path: '/assets/equity' },
                { icon: TrendingUp, label: t.investments.title, path: '/investments' },
                { icon: DollarSign, label: t.assets.liabilities, path: '/assets/liability' },
            ]
        },
        { icon: Target, label: t.budgets.title, path: '/budgets' },
        { icon: Bell, label: 'Reminders', path: '/reminders' },
        { icon: Settings, label: t.settings.title, path: '/settings' },
    ];

    const isChildActive = (children: { path: string }[]) => {
        return children.some(child => location.pathname === child.path);
    };

    return (
        <aside className={cn("hidden h-screen w-64 flex-col border-r bg-card text-card-foreground md:flex", className)}>
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-bold text-primary">{settings.appName || t.app.title}</span>
            </div>
            <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
                {navItems.map((item) => {
                    if (item.children) {
                        const isExpanded = expandedItems.includes(item.id!);
                        const hasActiveChild = isChildActive(item.children);

                        return (
                            <div key={item.id} className="space-y-1">
                                <button
                                    onClick={(e) => toggleExpand(item.id!, e)}
                                    className={cn(
                                        "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                        hasActiveChild ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </div>
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                                {isExpanded && (
                                    <div className="pl-4 space-y-1">
                                        {item.children.map((child) => (
                                            <NavLink
                                                key={child.path}
                                                to={child.path}
                                                onClick={handleLinkClick}
                                                className={({ isActive }) =>
                                                    cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                                        isActive ? "bg-primary/10 text-primary border-r-2 border-primary rounded-r-none" : "text-muted-foreground"
                                                    )
                                                }
                                            >
                                                <child.icon className="h-4 w-4" />
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
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
                    );
                })}
            </nav>
            <div className="p-4 border-t space-y-2">
                <button
                    onClick={() => {
                        startGuide('main-tour');
                        handleLinkClick();
                    }}
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
