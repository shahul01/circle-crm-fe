import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  login,
  clearAuthError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '@/store/slices/auth-slice';
import {
  addManyCustomers,
  selectTotalCustomers,
} from '@/store/slices/customer-slice';
import { addManyLeads, selectTotalLeads } from '@/store/slices/lead-slice';
import { addManyTasks, selectTotalTasks } from '@/store/slices/task-slice';
import { addNotification } from '@/store/slices/notification-slice';
import { getSeedState } from '@/services/seed';
import { loginSchema, type LoginForm } from '@/schemas/auth';
import { Button, Input, Label, ConfirmDialog } from '@/lib/components';

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const totalCustomers = useAppSelector(selectTotalCustomers);
  const totalLeads = useAppSelector(selectTotalLeads);
  const totalTasks = useAppSelector(selectTotalTasks);

  const [showPassword, setShowPassword] = useState(false);
  const [pendingSeedAfterLogin, setPendingSeedAfterLogin] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const isEmpty = totalCustomers === 0 && totalLeads === 0 && totalTasks === 0;
  const showSeedDialog = isAuthenticated && pendingSeedAfterLogin && isEmpty;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated && !showSeedDialog) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, showSeedDialog, navigate, from]);

  const onSubmit = (data: LoginForm) => {
    setPendingSeedAfterLogin(true);
    dispatch(login(data));
  };

  const handleSeedConfirm = () => {
    const seed = getSeedState();
    dispatch(
      addManyCustomers(
        seed.customers.ids.map((id) => seed.customers.entities[id])
      )
    );
    dispatch(addManyLeads(seed.leads.ids.map((id) => seed.leads.entities[id])));
    dispatch(addManyTasks(seed.tasks.ids.map((id) => seed.tasks.entities[id])));
    dispatch(
      addNotification(
        'Demo data loaded successfully',
        'Sample customers, leads and tasks have been added.',
        'success'
      )
    );
    setPendingSeedAfterLogin(false);
    navigate(from, { replace: true });
  };

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@circlecrm.com"
            error={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              error={!!errors.password}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          Sign in
        </Button>

        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Demo credentials:</p>
          <p>
            Admin: <span className="font-mono">admin@circlecrm.com</span> /{' '}
            <span className="font-mono">Admin@123</span>
          </p>
          <p>
            Sales: <span className="font-mono">sales@circlecrm.com</span> /{' '}
            <span className="font-mono">Sales@123</span>
          </p>
        </div>
      </form>

      <ConfirmDialog
        open={showSeedDialog}
        onOpenChange={(open) => {
          if (!open) {
            setPendingSeedAfterLogin(false);
            navigate(from, { replace: true });
          }
        }}
        title="Load demo data?"
        description="No customers, leads or tasks found. Would you like to load sample data to get started?"
        confirmLabel="Load demo data"
        cancelLabel="Start empty"
        onConfirm={handleSeedConfirm}
      />
    </>
  );
}

export default LoginPage;
