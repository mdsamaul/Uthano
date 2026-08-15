'use client';

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store';

/**
 * Simplified frontend role-based access control.
 *
 * Uses simple role checks instead of complex permission system.
 * All admin users (superadmin, admin, staff, warehouse_manager) have admin access.
 *
 * NOTE: Frontend role checks are ONLY for UX. Every action must also be
 * enforced by the backend middleware (`role:...`).
 */
export function useAccess() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const role = user?.role;
  const isSuperAdmin = role === 'superadmin';
  const isAdmin = ['superadmin', 'admin', 'staff', 'warehouse_manager'].includes(role || '');
  const isFarmer = role === 'farmer';
  const isCustomer = role === 'customer';

  const hasRole = useCallback(
    (allowedRoles: string | string[]) => {
      if (!role) return false;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      return roles.includes(role);
    },
    [role]
  );

  const hasAdminAccess = useCallback(() => {
    return isAdmin;
  }, [isAdmin]);

  const hasSuperAdminAccess = useCallback(() => {
    return isSuperAdmin;
  }, [isSuperAdmin]);

  /**
   * Simple permission helper for the simplified role system.
   * Admin roles (superadmin, admin, staff, warehouse_manager) implicitly
   * have every permission — matching the backend's `hasAdminAccess()`.
   */
  const hasPermission = useCallback(
    (_permission: string): boolean => isAdmin,
    [isAdmin]
  );

  return {
    role,
    isSuperAdmin,
    isAdmin,
    isFarmer,
    isCustomer,
    hasAdminAccess: hasAdminAccess(),
    hasSuperAdminAccess: hasSuperAdminAccess(),
    hasRole,
    hasPermission,
    // Kept for compatibility with admin shells/sidebars that gate on it.
    isLoading: false,
    isAuthenticated,
  };
}
