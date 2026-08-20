import { Route, Routes, Navigate } from 'react-router';
import { Layout1 } from '@/components/layouts/layout-1';
import { RequireAuth } from './RequireAuth';

import { LoginPage } from '@/pages/login/page';
import { RegisterPage } from '@/pages/register/page';
import { DashboardPage } from '@/pages/dashboard/page';
import { ReportsPage } from '@/pages/reports/page';
import { CustomRecapDetailPage } from '@/pages/reports/custom-recap-detail';
import { CustomCategoryHistoryPage } from '@/pages/reports/custom-category-history';
import { ProfilePage } from '@/pages/profile/page';
import { CategoriesPage } from '@/pages/categories/page';
import { TransactionsPage } from '@/pages/transactions/page';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<RequireAuth><Layout1 /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/custom/:id" element={<CustomRecapDetailPage />} />
        <Route path="/reports/custom/:id/category/:categoryName" element={<CustomCategoryHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
