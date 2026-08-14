<?php

namespace App\Services;

use App\Models\OtpVerification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OtpService
{
    /**
     * Generate and persist an OTP for the given phone number.
     * Returns the plain-text code so the caller can deliver it (SMS/webhook).
     * In non-production environments the code is also returned in the payload
     * so end-to-end flows can be tested without a real SMS provider.
     */
    public function request(string $phone, string $purpose = 'customer_login'): string
    {
        // Enforce a minimum wait between resends for the same phone + purpose.
        $latest = OtpVerification::where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if ($latest && !$latest->isExpired()) {
            $elapsed = now()->diffInSeconds($latest->resent_at ?? $latest->created_at);
            if ($elapsed < OtpVerification::RESEND_WAIT_SECONDS) {
                $wait = OtpVerification::RESEND_WAIT_SECONDS - (int) $elapsed;
                throw ValidationException::withMessages([
                    'phone' => ["Please wait {$wait} seconds before requesting a new code."],
                ]);
            }
        }

        $code = (string) random_int(100000, 999999);

        OtpVerification::create([
            'phone' => $phone,
            'purpose' => $purpose,
            'otp_code' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(OtpVerification::TTL_MINUTES),
            'resent_at' => now(),
        ]);

        // TODO: Replace with real SMS gateway / provider integration.
        Log::info('OTP requested', ['phone' => $phone, 'purpose' => $purpose, 'code' => $code]);

        return $code;
    }

    /**
     * Verify a submitted OTP. Throws ValidationException with a user-friendly
     * message on failure (invalid, expired, locked or too many attempts).
     */
    public function verify(string $phone, string $code, string $purpose = 'customer_login'): void
    {
        $record = OtpVerification::where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (!$record || $record->isVerified()) {
            throw ValidationException::withMessages([
                'otp' => ['No active code found for this phone number.'],
            ]);
        }

        if ($record->isLocked()) {
            throw ValidationException::withMessages([
                'otp' => ['Too many attempts. Please request a new code.'],
            ]);
        }

        if ($record->isExpired()) {
            throw ValidationException::withMessages([
                'otp' => ['The code has expired. Please request a new one.'],
            ]);
        }

        if (!Hash::check(trim($code), $record->otp_code)) {
            $record->increment('attempts');
            throw ValidationException::withMessages([
                'otp' => ['Invalid code. Please try again.'],
            ]);
        }

        $record->update(['verified_at' => now()]);
    }
}
