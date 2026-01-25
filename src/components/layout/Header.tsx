import { useStore } from '../../hooks/useStore';
import { Moon, Sun, Users, User } from 'lucide-react';

export function Header() {
    const { settings, updateSettings } = useStore();

    const toggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
    };

    const switchToSpace = (spaceId: string) => {
        updateSettings({ activeSpace: spaceId });
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">Personal Wealth</h1>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted p-1">
                        {settings.spaces?.map((space) => (
                            <button
                                key={space.id}
                                onClick={() => switchToSpace(space.id)}
                                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${settings.activeSpace === space.id
                                    ? 'bg-background shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {space.name === 'Family' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                {space.name}
                            </button>
                        ))}
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
