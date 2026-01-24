import { useStore } from '../../hooks/useStore';
import { Moon, Sun, Users, User } from 'lucide-react';

export function Header() {
    const { settings, updateSettings } = useStore();

    const toggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
    };

    const toggleProfile = () => {
        const newProfile = settings.activeProfile === 'personal' ? 'family' : 'personal';
        updateSettings({ activeProfile: newProfile });
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">FinanceFlow</h1>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted p-1">
                        <button
                            onClick={toggleProfile}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${settings.activeProfile === 'personal'
                                    ? 'bg-background shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <User className="h-4 w-4" />
                            Personal
                        </button>
                        <button
                            onClick={toggleProfile}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${settings.activeProfile === 'family'
                                    ? 'bg-background shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            Family
                        </button>
                    </div>
                </div>
                <button
                    onClick={toggleTheme}
                    className="rounded-md p-2 hover:bg-accent"
                    aria-label="Toggle theme"
                >
                    {settings.theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </button>
            </div>
        </header>
    );
}
