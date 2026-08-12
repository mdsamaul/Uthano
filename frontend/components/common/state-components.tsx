import Link from 'next/link';
import { AlertCircle, AlertTriangle, Inbox, Lock, ShieldAlert, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {icon || <Inbox className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center',
        className
      )}
      role="alert"
    >
      <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

interface NotFoundProps {
  title?: string;
  description?: string;
}

export function NotFound({
  title = 'Page Not Found',
  description = 'The page you are looking for does not exist.',
}: NotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

interface UnauthorizedProps {
  title?: string;
  description?: string;
}

export function Unauthorized({
  title = 'Unauthorized',
  description = 'Please login to access this page.',
}: UnauthorizedProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <Link href="/auth/login" className="mt-6">
        <Button>Login</Button>
      </Link>
    </div>
  );
}

interface ForbiddenProps {
  title?: string;
  description?: string;
}

export function Forbidden({
  title = 'Forbidden',
  description = 'You do not have permission to access this page.',
}: ForbiddenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ShieldAlert className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function NetworkErrorState({
  message = 'Network connection error. Please check your internet connection.',
  onRetry,
}: NetworkErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border p-8 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}