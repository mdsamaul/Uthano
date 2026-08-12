import Link from 'next/link';
import { LayoutDashboard, Wheat, Layers, BarChart3, Package } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

const FARMER_LINKS = [
  { label: 'Dashboard', href: '/farmer', icon: LayoutDashboard },
  { label: 'My Farms', href: '/farmer/farms', icon: Wheat },
  { label: 'My Harvests', href: '/farmer/harvests', icon: Layers },
  { label: 'My Batches', href: '/farmer/batches', icon: Package },
  { label: 'My Supply', href: '/farmer/sourcing', icon: BarChart3 },
  { label: 'Statistics', href: '/farmer/statistics', icon: LayoutDashboard },
];

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo />
        </div>
        <nav className="p-4" aria-label="Farmer navigation">
          <ul className="space-y-1">
            {FARMER_LINKS.map((link) => (
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
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="text-lg font-semibold">Farmer Portal</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            View Store
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
