'use client';

import { useEffect, useRef, useState } from 'react';
import { authService } from '@/services';
import { useAuthStore, useUIStore } from '@/store';
import { tokenStorage } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { isValidPhone } from '@/lib/utils';

/**
 * Minimal phone-number + OTP authentication for customers.
 *
 * Step 1: enter phone number → request OTP
 * Step 2: enter 6-digit code (with resend countdown + change phone)
 *
 * After successful verification the user is authenticated and `onSuccess` fires.
 */
export function OtpFlow({ onSuccess }: { onSuccess?: () => void }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const showToast = useUIStore((s) => s.showToast);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequest = async () => {
    setError(null);
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 11-digit Bangladeshi phone number (e.g. 01712345678).');
      return;
    }
    setSending(true);
    try {
      const result = await authService.requestOtp(phone);
      setDevCode(result.dev_code ?? null);
      setStep('otp');
      setOtp(result.dev_code ?? '');
      startCountdown(60);
      showToast('OTP sent successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    handleRequest();
  };

  const handleVerify = async () => {
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setVerifying(true);
    try {
      const result = await authService.verifyOtp(phone, otp);
      tokenStorage.set(result.token);
      setAuth(result.user, result.token);
      showToast('OTP verified successfully. Welcome!');
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed.';
      setError(message);
      if (/Too many attempts/i.test(message)) {
        setStep('phone');
        setOtp('');
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
      <h2 className="text-xl font-bold">Quick Checkout</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        No password needed — verify with your phone number and place your order.
      </p>

      {step === 'phone' ? (
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01712345678"
              error={error ?? undefined}
            />
          </div>
          <Button className="w-full" onClick={handleRequest} isLoading={sending} disabled={sending}>
            {sending ? 'Sending...' : 'Send OTP'}
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="text-muted-foreground">
              Code sent to <span className="font-semibold text-foreground">{phone}</span>
            </p>
            {devCode && !verifying && (
              <p className="mt-1 text-xs text-primary">
                Development code: <span className="font-mono font-bold">{devCode}</span>
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">6-Digit OTP</label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="······"
              className="text-center text-xl tracking-[0.5em]"
              error={error ?? undefined}
            />
          </div>
          <Button className="w-full" onClick={handleVerify} isLoading={verifying} disabled={verifying}>
            {verifying ? 'Verifying...' : 'Verify & Continue'}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setStep('phone'); setError(null); }}
              className="text-primary hover:underline"
            >
              Change phone number
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0}
              className="text-muted-foreground hover:text-primary disabled:pointer-events-none disabled:opacity-50"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
          {verifying && (
            <div className="flex justify-center">
              <Spinner className="h-5 w-5" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}