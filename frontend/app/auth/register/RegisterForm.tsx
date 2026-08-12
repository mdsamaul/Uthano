'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/validations';
import { useAuth } from '@/hooks/use-auth';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/brand/Logo';

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const showToast = useUIStore((state) => state.showToast);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      const user = await registerUser(data);
      showToast(`Welcome to UTHANO, ${user.name}!`);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <Card className="p-8">
      <div className="mb-6 text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join UTHANO - From Farm to Family
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Full Name
          </label>
          <Input
            id="name"
            placeholder="Your full name"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

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
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <Input
            id="phone"
            placeholder="01XXXXXXXXX"
            error={errors.phone?.message}
            {...register('phone')}
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

        <div>
          <label
            htmlFor="password_confirmation"
            className="mb-1 block text-sm font-medium"
          >
            Confirm Password
          </label>
          <Input
            id="password_confirmation"
            type="password"
            placeholder="••••••••"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </Card>
  );
}