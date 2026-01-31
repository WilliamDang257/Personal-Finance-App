/**
 * Cloud Sync Settings Component
 * 
 * Allows users to choose their storage mode (Local, Cloud, Hybrid) and manage sync settings.
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../hooks/useStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { Cloud, Server, Database, ShieldCheck, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type StorageOption = 'local' | 'cloud' | 'hybrid';

export function CloudSyncSettings() {
    const { settings, updateSettings, syncData, migrateToCloud, syncStatus, lastSyncError } = useStore();
    const { isAuthenticated, user } = useAuth();
    const { isOnline } = useNetworkStatus();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Current effective mode or default
    const currentMode = settings.storageMode || 'local';

    const handleModeChange = async (mode: StorageOption) => {
        if (mode === currentMode) return;

        if (mode !== 'local' && !isOnline) {
            alert('You must be online to switch to cloud storage.');
            return;
        }

        if (mode !== 'local' && !isAuthenticated) {
            // Require login for cloud/hybrid
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            await updateSettings({ storageMode: mode });

            // If switching TO cloud/hybrid FROM local, ask to migrate
            if (currentMode === 'local' && (mode === 'cloud' || mode === 'hybrid')) {
                // In a real app we might show a nice dialog. For now, confirm.
                if (window.confirm('Do you want to upload your existing local data to the cloud?')) {
                    await migrateToCloud();
                }
            }
        } catch (error) {
            console.error('Failed to change mode:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSync = async () => {
        await syncData();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Data Storage & Sync</h3>
                    <p className="text-sm text-muted-foreground">Choose where your financial data is stored</p>
                </div>
                {isAuthenticated && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Connected as {user?.email}
                    </div>
                )}
            </div>

            {/* Storage Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Local Only */}
                <button
                    onClick={() => handleModeChange('local')}
                    disabled={loading}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${currentMode === 'local'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-gray-300 dark:hover:border-gray-700 bg-card'
                        }`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className={`p-2 rounded-lg ${currentMode === 'local' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Server className="h-5 w-5" />
                        </div>
                        {currentMode === 'local' && (
                            <div className="p-1 bg-primary text-white rounded-full">
                                <ShieldCheck className="h-3 w-3" />
                            </div>
                        )}
                    </div>
                    <h4 className="font-semibold mb-1">Local Only</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Data stays on this device. Most private, but no backup or cross-device sync.
                    </p>
                </button>

                {/* Cloud Sync */}
                <button
                    onClick={() => handleModeChange('cloud')}
                    disabled={loading}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${currentMode === 'cloud'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-gray-300 dark:hover:border-gray-700 bg-card'
                        }`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className={`p-2 rounded-lg ${currentMode === 'cloud' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Cloud className="h-5 w-5" />
                        </div>
                        {currentMode === 'cloud' && (
                            <div className="p-1 bg-primary text-white rounded-full">
                                <ShieldCheck className="h-3 w-3" />
                            </div>
                        )}
                    </div>
                    <h4 className="font-semibold mb-1">Cloud Sync</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Data stored securely in cloud. Real-time sync across all your devices.
                    </p>
                </button>

                {/* Hybrid Mode */}
                <button
                    onClick={() => handleModeChange('hybrid')}
                    disabled={loading}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${currentMode === 'hybrid'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-gray-300 dark:hover:border-gray-700 bg-card'
                        }`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className={`p-2 rounded-lg ${currentMode === 'hybrid' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Database className="h-5 w-5" />
                        </div>
                        {currentMode === 'hybrid' && (
                            <div className="p-1 bg-primary text-white rounded-full">
                                <ShieldCheck className="h-3 w-3" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">Hybrid Mode</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            BEST
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Fast local access + automatic cloud backup. Best of both worlds.
                    </p>
                </button>
            </div>

            {/* Sync Status Details */}
            {currentMode !== 'local' && (
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            {isOnline ? (
                                <RefreshCw className={`h-4 w-4 text-primary ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                            ) : (
                                <WifiOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            Sync Status
                        </h4>
                        <button
                            className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                            onClick={handleManualSync}
                            disabled={syncStatus === 'syncing' || !isOnline}
                        >
                            {!isOnline ? 'Offline' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                        </button>
                    </div>
                    <div className="p-4 bg-card">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`font-medium ${!isOnline ? 'text-amber-600' :
                                    syncStatus === 'error' ? 'text-destructive' : 'text-foreground'
                                }`}>
                                {!isOnline ? 'Waiting for connection...' : syncStatus === 'idle' ? 'Up to date' : syncStatus === 'syncing' ? 'Syncing...' : 'Error'}
                            </span>
                        </div>
                        {lastSyncError && isOnline && (
                            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded mb-2">
                                {lastSyncError}
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cloud storage:</span>
                            <span className={`${isOnline ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'} font-medium flex items-center gap-1`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                {isOnline ? 'Connected' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Message for Not Logged In */}
            {currentMode === 'local' && !isAuthenticated && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
                    <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded-full shrink-0">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Enable Cloud Backup</h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Sign in to enable automatic cloud backup and sync your data across devices.
                            Your data remains private and secure.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                        >
                            Sign In / Create Account →
                        </button>
                    </div>
                </div>
            )}

            {/* Warning when switching from Local to Cloud */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Privacy Note</h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 leading-relaxed">
                            <strong>Local Only:</strong> Data is stored only in your browser. Clearing cache deletes data.<br />
                            <strong>Cloud/Hybrid:</strong> Data is stored securely in your private cloud database.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
