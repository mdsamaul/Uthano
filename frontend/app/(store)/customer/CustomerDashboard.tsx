'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { RoleProtectedRoute } from '@/components/role-protected-route';
import { useAuth } from '@/hooks/use-auth';
import { customerService } from '@/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { LogOut, Package, MapPin, User, Smartphone, Hash, ShoppingBag, Layers } from 'lucide-react';

export function CustomerDashboard() {
  const { user, logout } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['customer', 'profile'],
    queryFn: () => customerService.getProfile(),
  });

  const profile = profileQuery.data;

  const quickLinks = [
    { href: '/profile', label: 'My Profile', icon: User },
    { href: '/profile/orders', label: 'My Orders', icon: Package },
    { href: '/profile/addresses', label: 'My Addresses', icon: MapPin },
    { href: '/wishlist', label: 'My Wishlist', icon: Package },
  ];

  return (
    <RoleProtectedRoute allowedRoles="customer" fallbackRoute="/" loginRedirect="/auth/login">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back{user?.name ? `, ${user.name}` : ''}! Manage your account and orders.
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Profile summary */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profile?.full_name ?? user?.name ?? 'Customer'}</h2>
                <p className="text-xs text-muted-foreground">{profile?.customer_code ?? '—'}</p>
              </div>
            </div>

            {profileQuery.isLoading ? (
              <div className="mt-6 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <dl className="mt-6 space-y-3 text-sm">
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Smartphone className="h-3.5 w-3.5" /> Phone
                  </dt>
                  <dd className="mt-0.5 font-medium">{profile?.phone ?? user?.phone ?? '—'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" /> Customer Code
                  </dt>
                  <dd className="mt-0.5 font-medium">{profile?.customer_code ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 font-medium">{user?.email || '—'}</dd>
                </div>
              </dl>
            )}

            <Link href="/profile" className="mt-6 block">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </Link>
          </Card>

          {/* Quick access */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold">Quick Access</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-lg border border-border p-5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">View and manage</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Start Shopping</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Link
                  href="/products"
                  className="flex items-center gap-4 rounded-lg border border-dashed border-primary/40 p-5 transition-colors hover:bg-primary/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Browse Products</p>
                    <p className="text-xs text-muted-foreground">Shop fresh produce &amp; groceries</p>
                  </div>
                </Link>
                <Link
                  href="/categories"
                  className="flex items-center gap-4 rounded-lg border border-dashed border-primary/40 p-5 transition-colors hover:bg-primary/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Browse Categories</p>
                    <p className="text-xs text-muted-foreground">Explore by category</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
