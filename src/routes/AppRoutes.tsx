import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CustomerListPage from '@/pages/customers/customer-list-page';
import CustomerDetailPage from '@/pages/customers/customer-detail-page';
import NotFoundPage from '@/pages/NotFoundPage';
import { ToastContainer } from '@/lib/components';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectNotifications,
  dismissNotification,
} from '@/store/slices/notification-slice';

function AppRoutes() {
  const notifications = useAppSelector(selectNotifications);
  const dispatch = useAppDispatch();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/leads/*" element={<LeadRoutes />} />
          <Route path="/tasks/*" element={<TaskRoutes />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer
        toasts={notifications}
        onDismiss={(id) => dispatch(dismissNotification(id))}
      />
    </BrowserRouter>
  );
}

function LeadRoutes() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Leads</h2>
      <p className="text-sm text-muted-foreground">Coming in Phase 6</p>
    </div>
  );
}

function TaskRoutes() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
      <p className="text-sm text-muted-foreground">Coming in Phase 7</p>
    </div>
  );
}

export default AppRoutes;
