'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, User, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useCartStore, useAuthStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Categories', href: '/categories' },
  { label: 'Shop', href: '/products' },
  { label: 'Farms', href: '/farms' },
  { label: 'About UTHANO', href: '/about' },
];

export function Header() {
  const router = useRouter();
  const { getItemCount } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { setMobileMenuOpen, setSearchOpen, setCartDrawerOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemCount = mounted ? getItemCount() : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur transition-shadow',
        isScrolled && 'shadow-sm'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          className="lg:hidden rounded-md p-2 hover:bg-muted"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Logo />

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fresh products..."
              className="w-full rounded-full border border-border bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search products"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search for mobile */}
          <button
            className="md:hidden rounded-md p-2 hover:bg-muted"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Account */}
          {isAuthenticated && user ? (
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 rounded-md p-2 hover:bg-muted"
              aria-label="My account"
            >
              <User className="h-5 w-5" />
              <span className="hidden xl:block text-sm font-medium max-w-[100px] truncate">
                {user.name}
              </span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center gap-1 rounded-md p-2 hover:bg-muted"
              aria-label="Login"
            >
              <User className="h-5 w-5" />
              <span className="hidden xl:block text-sm font-medium">Login</span>
            </Link>
          )}

          {/* Cart */}
          <button
            className="relative rounded-md p-2 hover:bg-muted"
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Cart with ${itemCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileSearchOverlay() {
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const router = useRouter();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur animate-fade-in md:hidden">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              router.push(`/products?search=${encodeURIComponent(query.trim())}`);
              setSearchOpen(false);
              setQuery('');
            }
          }}
          className="flex-1"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fresh products..."
              className="w-full rounded-full border border-border bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search products"
            />
          </div>
        </form>
        <button
          onClick={() => setSearchOpen(false)}
          className="rounded-md p-2 hover:bg-muted"
          aria-label="Close search"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Try searching for <span className="font-bangla text-foreground">&ldquo;আম&rdquo;</span>, guava, or mango
        </p>
      </div>
    </div>
  );
}