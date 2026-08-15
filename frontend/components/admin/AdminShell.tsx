'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Store, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAccess } from '@/hooks/use-access';
import { useRolePath } from '@/lib/role-utils';
import { Logo } from '@/components/brand/Logo';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Forbidden } from '@/components/common/state-components';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

/**
 * Permission-guarded admin shell.
 *
 * - Unauthenticated sessions are redirected to the login page.
 * - Authenticated users without an admin role see a 403 screen.
 * - The sidebar only shows menus the user has permission to access.
 *
 * Frontend guards here are UX only — the backend enforces every permission.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isRestoring, logout } = useAuth();
  const { isAdmin, isSuperAdmin, isLoading: accessLoading } = useAccess();
  const { to } = useRolePath();

  useEffect(() => {
    if (!isRestoring && !isAuthenticated && !pathname.startsWith('/auth/login')) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isRestoring, isAuthenticated, pathname, router]);

  if (isRestoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Spinner />
      </div>
    );
  }

  if (!isAdmin) {
    return <Forbidden />;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

      return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href={to('/')}>
            <Logo />
          </Link>
        </div>
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
          <AdminSidebar />
        </div>
      </aside>

            {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-card shadow-lg">
            <div className="flex h-16 items-center border-b border-border px-6">
              <Link href={to('/')} onClick={() => setMobileOpen(false)}>
                <Logo />
              </Link>
            </div>
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
              <AdminSidebar />
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-md p-2 hover:bg-muted lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline">
                Super Admin
              </span>
            )}
            <Link
              href="/"
              className="hidden items-center gap-2 text-sm text-muted-foreground hover:text-primary sm:flex"
            >
              <Store className="h-4 w-4" />
              View Store
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}