import Link from 'next/link';
import { LayoutDashboard, Truck, PackageCheck } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

const DELIVERY_LINKS = [
  { label: 'Dashboard', href: '/delivery', icon: LayoutDashboard },
  { label: 'My Deliveries', href: '/delivery/deliveries', icon: Truck },
  { label: 'Completed', href: '/delivery/completed', icon: PackageCheck },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo />
        </div>
        <nav className="p-4" aria-label="Delivery navigation">
          <ul className="space-y-1">
            {DELIVERY_LINKS.map((link) => (
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
          <h1 className="text-lg font-semibold">Delivery Agent</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            View Store
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
