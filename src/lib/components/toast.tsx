import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const icons = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = icons[toast.variant ?? 'default'];
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration ?? 4000);

    return () => clearTimeout(timeout);
  }, [toast.id, toast.duration, onDismiss]);

  const bgColors = {
    default: 'bg-card border-border',
    success: 'bg-success/10 border-success/30',
    error: 'bg-destructive/10 border-destructive/30',
  };

  const iconColors = {
    default: 'text-primary',
    success: 'text-success',
    error: 'text-destructive',
  };

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all',
        bgColors[toast.variant ?? 'default'],
        exiting
          ? 'opacity-0 translate-x-4 animate-out'
          : 'opacity-100 translate-x-0 animate-in'
      )}
      role="alert"
    >
      <Icon
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0',
          iconColors[toast.variant ?? 'default']
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {toast.description}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export { ToastContainer, ToastItem };
