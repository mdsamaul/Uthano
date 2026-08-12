import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Sprout,
  Home,
  Wheat,
  Layers,
  Warehouse,
  Truck,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

const ADMIN_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Farmers', href: '/admin/farmers', icon: Sprout },
  { label: 'Farms', href: '/admin/farms', icon: Home },
  { label: 'Harvests', href: '/admin/harvests', icon: Wheat },
  { label: 'Batches', href: '/admin/batches', icon: Layers },
  { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { label: 'Deliveries', href: '/admin/deliveries', icon: Truck },
  { label: 'Quality Checks', href: '/admin/quality-checks', icon: ShieldCheck },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo />
        </div>
        <nav className="p-4" aria-label="Admin navigation">
          <ul className="space-y-1">
            {ADMIN_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            View Store
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}