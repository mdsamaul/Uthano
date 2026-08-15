'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAccess } from '@/hooks/use-access';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  // Required role(s) to access this route
  allowedRoles: string | string[];
  // Where to redirect if authenticated but doesn't have the required role
  fallbackRoute?: string;
  // Where to redirect if not authenticated
  loginRedirect?: string;
  // Where to redirect if authenticated and has the required role
  successRoute?: string;
  // Loading message
  loadingMessage?: string;
  // Children to render if authenticated and authorized
  children?: React.ReactNode;
}

export function RoleProtectedRoute({
  allowedRoles,
  fallbackRoute = '/',
  loginRedirect,
  successRoute,
  loadingMessage = 'Loading...',
  children,
}: RoleProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isRestoring } = useAuth();
  const { hasRole } = useAccess();

  useEffect(() => {
    // Don't redirect while loading or restoring session
    if (isLoading || isRestoring) {
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const redirectPath = loginRedirect || `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      router.push(redirectPath);
      return;
    }

    if (hasRole(allowedRoles)) {
      // User has the required role
      if (successRoute) {
        router.push(successRoute);
      }
      // If no successRoute, render children (if provided)
    } else {
      // User is authenticated but doesn't have the required role
      router.push(fallbackRoute);
    }
  }, [isAuthenticated, isLoading, isRestoring, hasRole, allowedRoles, fallbackRoute, loginRedirect, successRoute, router]);

  // Show loading state
  if (isLoading || isRestoring) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated and authorized (and no redirect)
  if (isAuthenticated && hasRole(allowedRoles) && !successRoute) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-2 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}