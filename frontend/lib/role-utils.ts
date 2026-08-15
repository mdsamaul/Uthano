// ============================================
// Role-based URL utilities
// ============================================

import { usePathname } from 'next/navigation';

export const ADMIN_ROLES = ['superadmin', 'admin', 'staff', 'warehouse_manager'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function getRolePrefix(role: string): string {
  // Map role to URL prefix — superadmin gets /superadmin, admin gets /admin
  return `/${role}`;
}

/**
 * Hook that extracts the current role prefix from the URL.
 * e.g. `/superadmin/products` => role="superadmin", basePath="/superadmin"
 */
export function useRolePath() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const role = segments[0] || 'admin';
  const basePath = `/${role}`;

  const to = (segment: string): string => `${basePath}${segment.startsWith('/') ? segment : '/' + segment}`;

  return { role, basePath, to };
}

/**
 * Returns the dashboard path for a given role.
 */
export function getDashboardPath(role: string): string {
  return `/${role}/dashboard`;
}

/**
 * Returns the products path for a given role.
 */
export function getProductsPath(role: string): string {
  return `/${role}/products`;
}
