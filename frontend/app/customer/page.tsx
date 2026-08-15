'use client';

import { RoleProtectedRoute } from '@/components/role-protected-route';

export default function CustomerPage() {
  return (
    <RoleProtectedRoute
      allowedRoles="customer"
      fallbackRoute="/"
      loginRedirect="/auth/login?redirect=/customer"
      successRoute="/profile/orders"
      loadingMessage="Loading Customer Dashboard..."
    />
  );
}