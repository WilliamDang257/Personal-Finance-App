import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Users, User, LogOut, LogIn, WifiOff, Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { settings, updateSettings } = useStore();
    const { user, isAuthenticated, displayName, photoURL, signOut } = useAuth();
    const { isOnline } = useNetworkStatus();
    const navigate = useNavigate();

    const toggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
    };

    const switchToSpace = (spaceId: string) => {
        updateSettings({ activeSpace: spaceId });
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-md transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold">Personal Wealth</h1>
                    {!isOnline && (
                        <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full animate-pulse">
                            <WifiOff className="h-3 w-3" />
                            <span className="hidden sm:inline">Offline</span>
                        </div>
                    )}
                    <div className="hidden md:flex items-center gap-2 rounded-lg border bg-muted p-1">
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

                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
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

                    {/* User Profile / Login */}
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-3 border-l pl-3">
                            <div className="flex items-center gap-2">
                                {photoURL ? (
                                    <img
                                        src={photoURL}
                                        alt={displayName || 'User'}
                                        className="h-8 w-8 rounded-full ring-2 ring-background"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                                <span className="text-sm font-medium hidden sm:inline">
                                    {displayName || 'User'}
                                </span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="rounded-md p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Sign out"
                                title="Sign out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 rounded-md px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Sign In</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
