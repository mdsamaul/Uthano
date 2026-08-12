'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/lib/validations';
import { authService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/brand/Logo';
import { CheckCircle2 } from 'lucide-react';

type ForgotPasswordFormData = {
  email: string;
};

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        <h1 className="text-2xl font-bold">Check Your Email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent you a password reset link. Please check your email
          inbox.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block text-sm text-primary hover:underline"
        >
          Back to Login
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="mb-6 text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email to receive a reset link
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </Card>
  );
}
