'use client';

import { RoleProtectedRoute } from '@/components/role-protected-route';
import { AdminDashboard } from '@/app/admin/AdminDashboard';
import { useRolePath, ADMIN_ROLES } from '@/lib/role-utils';

export default function RoleDashboardPage() {
  const { to } = useRolePath();

  return (
    <RoleProtectedRoute
      allowedRoles={[...ADMIN_ROLES]}
      fallbackRoute={to('/')}
      loginRedirect="/auth/login"
    >
      <AdminDashboard />
    </RoleProtectedRoute>
  );
}
