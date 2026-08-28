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
  exitDelay?: number;
}

const icons = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

function ToastItem({ toast, onDismiss, exitDelay = 0 }: ToastItemProps) {
  const Icon = icons[toast.variant ?? 'default'];
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
      },
      (toast.duration ?? 4000) + exitDelay
    );

    return () => clearTimeout(timeout);
  }, [toast.id, toast.duration, exitDelay, onDismiss]);

  const bgColors = {
    default: 'bg-card border-border',
    success: 'bg-success border-success-foreground',
    error: 'bg-destructive border-destructive-foreground',
  };

  const iconColors = {
    default: 'text-primary',
    success: 'text-success-foreground',
    error: 'text-destructive-foreground',
  };

  const textColors = {
    default: 'text-foreground',
    success: 'text-success-foreground',
    error: 'text-destructive-foreground',
  };

  const mutedTextColors = {
    default: 'text-muted-foreground',
    success: 'text-success-foreground/80',
    error: 'text-destructive-foreground/80',
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
        <p
          className={cn(
            'text-sm font-medium',
            textColors[toast.variant ?? 'default']
          )}
        >
          {toast.title}
        </p>
        {toast.description && (
          <p
            className={cn(
              'mt-1 text-xs',
              mutedTextColors[toast.variant ?? 'default']
            )}
          >
            {toast.description}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-5 w-5 shrink-0 hover:bg-transparent',
          mutedTextColors[toast.variant ?? 'default'],
          'hover:text-foreground'
        )}
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
    <div className="fixed bottom-4 right-4 z100 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          exitDelay={index * 400}
        />
      ))}
    </div>
  );
}

export { ToastContainer, ToastItem };
