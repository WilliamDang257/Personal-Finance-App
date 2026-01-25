
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TransactionsPage } from './features/transactions/TransactionsPage';

import { AssetsPage } from './features/assets/AssetsPage';
import { BudgetsPage } from './features/budgets/BudgetsPage';
import { SettingsPage } from './features/settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="assets/equity" element={<AssetsPage mode="equity" />} />
          <Route path="assets/liability" element={<AssetsPage mode="liability" />} />
          <Route path="assets" element={<Navigate to="assets/equity" replace />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
