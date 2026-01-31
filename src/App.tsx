
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then(module => ({ default: module.DashboardPage })));
const TransactionsPage = lazy(() => import('./features/transactions/TransactionsPage').then(module => ({ default: module.TransactionsPage })));
const AssetsPage = lazy(() => import('./features/assets/AssetsPage').then(module => ({ default: module.AssetsPage })));
const BudgetsPage = lazy(() => import('./features/budgets/BudgetsPage').then(module => ({ default: module.BudgetsPage })));
const RemindersPage = lazy(() => import('./features/reminders/RemindersPage'));
const InvestmentsPage = lazy(() => import('./features/investments/InvestmentsPage').then(module => ({ default: module.InvestmentsPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then(module => ({ default: module.SettingsPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(module => ({ default: module.LoginPage })));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

import { LockScreen } from './components/auth/LockScreen';
import { useStore } from './hooks/useStore';

import { useEffect } from 'react'; // Ensure React import includes useEffect

function App() {
  const { isLocked, settings, syncTransactionsFromSheets, initializeSync } = useStore(); // destructure sync action
  const shouldLock = isLocked && settings.security?.enabled;

  useEffect(() => {
    // Initialize cloud sync listeners
    initializeSync();

    // Attempt silent sync on mount if enabled
    if (settings.googleSheets?.enabled) {
      syncTransactionsFromSheets(true);
    }
  }, []); // Run once on mount

  return (
    <BrowserRouter>
      {shouldLock && <LockScreen />}
      <div className={shouldLock ? 'blur-sm pointer-events-none select-none h-screen overflow-hidden' : ''}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public route - no layout */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes - with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="investments" element={<InvestmentsPage />} />
              <Route path="assets/equity" element={<AssetsPage mode="equity" />} />
              <Route path="assets/liability" element={<AssetsPage mode="liability" />} />
              <Route path="assets" element={<Navigate to="assets/equity" replace />} />
              <Route path="budgets" element={<BudgetsPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
