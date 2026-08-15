'use client';

import { RoleProtectedRoute } from '@/components/role-protected-route';
import { AdminDashboard } from '../AdminDashboard';

const ADMIN_ROLES = ['superadmin', 'admin', 'staff', 'warehouse_manager'];

export default function AdminDashboardPage() {
  return (
    <RoleProtectedRoute
      allowedRoles={ADMIN_ROLES}
      fallbackRoute="/"
      loginRedirect="/auth/login?redirect=/admin/dashboard"
    >
      <AdminDashboard />
    </RoleProtectedRoute>
  );
}