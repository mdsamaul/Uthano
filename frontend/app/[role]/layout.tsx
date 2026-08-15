'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ADMIN_ROLES } from '@/lib/role-utils';

export const dynamic = 'force-dynamic';

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const role = pathname.split('/')[1] || 'admin';

  useEffect(() => {
    // Non-admin roles use their own portals, not the admin shell.
    if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
      const home = role === 'farmer' ? '/farmer' : role === 'delivery_agent' ? '/delivery' : role === 'customer' ? '/' : '/';
      router.replace(home);
    }
  }, [role, router]);

  if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
    // Redirecting to the role's own portal.
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
