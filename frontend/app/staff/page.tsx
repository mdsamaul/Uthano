'use client';

import { RoleProtectedRoute } from '@/components/role-protected-route';

export default function StaffPage() {
  return (
    <RoleProtectedRoute
      allowedRoles="staff"
      fallbackRoute="/"
      loginRedirect="/auth/login?redirect=/staff"
      successRoute="/staff/dashboard"
      loadingMessage="Loading Staff Dashboard..."
    />
  );
}