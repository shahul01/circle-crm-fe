import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CustomerListPage from '@/pages/customers/customer-list-page';
import CustomerDetailPage from '@/pages/customers/customer-detail-page';
import LeadListPage from '@/pages/leads/lead-list-page';
import TasksPage from '@/pages/tasks/tasks-page';
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
          <Route path="/leads" element={<LeadListPage />} />
          <Route path="/tasks" element={<TasksPage />} />
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

export default AppRoutes;
