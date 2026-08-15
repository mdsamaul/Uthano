'use client';

import { RoleProtectedRoute } from '@/components/role-protected-route';
import { AdminDashboard } from '../AdminDashboard';
import { useRolePath } from '@/lib/role-utils';

const ADMIN_ROLES = ['superadmin', 'admin', 'staff', 'warehouse_manager'];

export default function AdminDashboardPage() {
  const { to } = useRolePath();
  const loginRedirect = `/auth/login?redirect=${to('/dashboard')}`;

  return (
    <RoleProtectedRoute
      allowedRoles={ADMIN_ROLES}
      fallbackRoute={to('/dashboard')}
      loginRedirect={loginRedirect}
    >
      <AdminDashboard />
    </RoleProtectedRoute>
  );
}