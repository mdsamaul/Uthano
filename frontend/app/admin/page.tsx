'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const ADMIN_ROLES = ['superadmin', 'admin', 'staff', 'warehouse_manager'];

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isRestoring, user } = useAuth();

  useEffect(() => {
    // Don't redirect while loading or restoring session
    if (isLoading || isRestoring) {
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/auth/login?redirect=/admin');
      return;
    }

    // Check if user has admin role
    if (user && ADMIN_ROLES.includes(user.role)) {
      // Redirect to dashboard
      router.push('/admin/dashboard');
    } else {
      // Redirect to home if not admin
      router.push('/');
    }
  }, [isAuthenticated, isLoading, isRestoring, user, router]);

  // Show loading state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-2 text-muted-foreground">Loading Admin Dashboard...</p>
      </div>
    </div>
  );
}