'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Search, Package, User, X } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/products', icon: ShoppingBag },
  { label: 'Search', href: '/products', icon: Search },
  { label: 'Orders', href: '/profile/orders', icon: Package },
  { label: 'Account', href: '/profile', icon: User },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 text-[10px] font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-modal animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="text-lg font-bold text-primary">UTHANO</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-2 hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4" aria-label="Mobile menu">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Shop All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/farms"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Farms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    About UTHANO
                  </Link>
                </li>
              </ul>

              <div className="mt-6 border-t border-border pt-4">
                {isAuthenticated ? (
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
                  >
                    My Account
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}