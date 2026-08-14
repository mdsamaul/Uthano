'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ComponentType } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ShoppingCart,
  Layers,
  Package,
  FolderTree,
  Warehouse,
  Home,
  Sprout,
  Wheat,
  Truck,
  Ticket,
  BarChart3,
  ClipboardList,
  Settings,
  ShieldCheck,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccess } from '@/hooks/use-access';
import { Logo } from '@/components/brand/Logo';
import { Spinner } from '@/components/ui/spinner';

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<LucideProps>;
  permission?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard, permission: 'dashboard.view' }],
  },
  {
    label: 'Management',
    items: [
      { label: 'Admins', href: '/admin/admins', icon: UserPlus, permission: 'user.view' },
      { label: 'Customers', href: '/admin/customers', icon: Users, permission: 'customer.view' },
      { label: 'Roles', href: '/admin/roles', icon: ShieldCheck, permission: 'role.view' },
    ],
  },
  {
    label: 'Products',
    items: [
      { label: 'Categories', href: '/admin/categories', icon: FolderTree, permission: 'category.view' },
      { label: 'Products', href: '/admin/products', icon: Package, permission: 'product.view' },
      { label: 'Batches', href: '/admin/batches', icon: Layers, permission: 'batch.view' },
      { label: 'Inventory', href: '/admin/inventory', icon: Warehouse, permission: 'inventory.view' },
    ],
  },
  {
    label: 'Farms',
    items: [
      { label: 'Farms', href: '/admin/farms', icon: Home, permission: 'farm.view' },
      { label: 'Farmers', href: '/admin/farmers', icon: Sprout, permission: 'farmer.view' },
      { label: 'Harvests', href: '/admin/harvests', icon: Wheat, permission: 'harvest.view' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, permission: 'order.view' },
      { label: 'Deliveries', href: '/admin/deliveries', icon: Truck, permission: 'delivery.view' },
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket, permission: 'coupon.view' },
    ],
  },
  {
    label: 'Reports',
    items: [{ label: 'Reports', href: '/admin/reports', icon: BarChart3, permission: 'report.view' }],
  },
  {
    label: 'System',
    items: [
      { label: 'Quality Checks', href: '/admin/quality-checks', icon: ClipboardList, permission: 'quality-check.view' },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList, permission: 'audit.view' },
      { label: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings.view' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSuperAdmin, hasPermission, isLoading } = useAccess();

  const groups = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => isSuperAdmin || (item.permission ? hasPermission(item.permission) : true)),
    })).filter((group) => group.items.length > 0);
  }, [isSuperAdmin, hasPermission]);

  return (
    <nav className="p-4" aria-label="Admin navigation">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-5 w-5" />
        </div>
      ) : (
        <ul className="space-y-5">
          {groups.map((group) => (
            <li key={group.label}>
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
          <li className="pt-2">
            <Link
              href="/auth/login"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Account
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}