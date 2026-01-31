/**
 * Storage Adapters Export
 * 
 * Centralized export for all storage adapters and types.
 * Import everything you need from this single file.
 */

// Types
export type { StorageAdapter, StorageMode, SyncableDocument, AppData } from './StorageAdapter';

// Adapters
export { LocalStorageAdapter } from './LocalStorageAdapter';
export { FirebaseAdapter } from './FirebaseAdapter';
