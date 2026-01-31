/**
 * Storage Factory
 * 
 * Manages the creation and retrieval of storage adapters based on the selected mode.
 * Implements the Singleton pattern to ensure only one adapter is active at a time.
 */

import type { StorageAdapter, StorageMode } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { FirebaseAdapter } from './FirebaseAdapter';


export class StorageFactory {
    private static instance: StorageAdapter | null = null;
    private static currentMode: StorageMode = 'local';

    /**
     * Get the current storage adapter instance.
     * Creates it if it doesn't exist.
     */
    static async getAdapter(mode: StorageMode = 'local'): Promise<StorageAdapter> {
        // If mode changed or no instance, create new one
        if (!this.instance || this.currentMode !== mode) {
            // cleanup previous if exists
            if (this.instance) {
                // We don't disconnect here because we might want to keep connections alive
                // or handle migration. For now, we'll just switch references.
                // But properly, we might want to call disconnect() if it's expensive.
            }

            this.currentMode = mode;
            this.instance = this.createAdapter(mode);
            await this.instance.initialize();
        }

        return this.instance;
    }

    private static createAdapter(mode: StorageMode): StorageAdapter {
        switch (mode) {
            case 'local':
                return new LocalStorageAdapter();
            case 'firebase':
                return new FirebaseAdapter();
            default:
                console.warn(`Unknown storage mode: ${mode}, falling back to local`);
                return new LocalStorageAdapter();
        }
    }

    /**
     * Force reset the adapter (useful when settings change)
     */
    static async reset(): Promise<void> {
        this.instance = null;
    }
}
