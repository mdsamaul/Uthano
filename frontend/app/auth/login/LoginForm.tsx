'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/brand/Logo';
import { PhoneOtpLogin } from '@/components/auth/PhoneOtpLogin';
import { cn } from '@/lib/utils';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isRestoring } = useAuth();
  const showToast = useUIStore((state) => state.showToast);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'email' | 'phone'>('email');

  // Resolve the home page for a role:
  //   superadmin/admin/staff/warehouse_manager -> /{role}/dashboard
  //   customer -> /customer (customer dashboard)
  //   farmer -> /farmer, delivery_agent -> /delivery
  const roleHome = (role: string): string => {
    if (role === 'customer') return '/customer';
    if (role === 'farmer') return '/farmer';
    if (role === 'delivery_agent') return '/delivery';
    return `/${role}/dashboard`;
  };

  // If a valid session is already restored (e.g. after a hard refresh
  // bounced here from middleware), send the user straight to their area.
  useEffect(() => {
    if (isRestoring || !isAuthenticated) return;
    const user = useAuthStore.getState().user;
    router.replace(user ? roleHome(user.role) : '/');
  }, [isAuthenticated, isRestoring, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const user = await login(data);
      showToast(`Welcome back, ${user.name}!`);

      const redirect = searchParams.get('redirect');
      const target = roleHome(user.role);
      router.push(redirect && redirect.startsWith('/' + user.role) ? redirect : target);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <Card className="p-8">
      <div className="mb-6 text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'email' ? 'Login to your UTHANO account' : 'Login with your phone number via OTP'}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => {
            setMode('email');
            setError(null);
          }}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'email' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('phone');
            setError(null);
          }}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'phone' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Phone + OTP
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {mode === 'email' ? (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </>
      ) : (
        <PhoneOtpLogin onSwitchToEmail={() => setMode('email')} />
      )}
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
      <LoginFormContent />
    </Suspense>
  );
}
