'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isRestoring, user } = useAuth();

  useEffect(() => {
    if (isLoading || isRestoring) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/admin');
      return;
    }

    if (user) {
      const target = `/${user.role}/dashboard`;
      if (window.location.pathname !== target) {
        router.replace(target);
      }
    } else {
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