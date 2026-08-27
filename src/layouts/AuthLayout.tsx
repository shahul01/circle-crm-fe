import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <span className="text-lg font-bold">C</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Circle CRM</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
