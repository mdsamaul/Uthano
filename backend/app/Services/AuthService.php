<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\CustomerProfile;
use App\Models\OtpVerification;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'role' => 'customer',
        ]);

        // Create customer profile
        $customerProfile = CustomerProfile::create([
            'user_id' => $user->id,
            'customer_code' => $this->generateCustomerCode(),
            'full_name' => $data['name'],
            'phone' => $data['phone'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    /**
     * Request an OTP for a phone number. The returned code is the plain-text
     * code that must be delivered via SMS/webhook. In dev it is also echoed
     * back so the flow can be tested end-to-end.
     */
    public function requestOtp(string $phone): array
    {
        $code = app(OtpService::class)->request($phone);

        return [
            'phone' => $phone,
            'expires_in' => OtpVerification::TTL_MINUTES * 60,
            'dev_code' => config('app.env') !== 'production' ? $code : null,
        ];
    }

    /**
     * Verify an OTP, then find-or-create the customer user tied to the phone
     * number and issue an API token.
     */
    public function verifyOtp(string $phone, string $code): array
    {
        app(OtpService::class)->verify($phone, $code);

        $user = User::where('phone', $phone)->first();

        if (!$user) {
            $user = User::create([
                'name' => 'Customer',
                'email' => null,
                'password' => Hash::make(str()->random(32)),
                'phone' => $phone,
                'is_active' => true,
                'role' => 'customer',
            ]);
            CustomerProfile::create([
                'user_id' => $user->id,
                'customer_code' => $this->generateCustomerCode(),
                'full_name' => 'Customer',
                'phone' => $phone,
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'phone' => ['This account has been deactivated.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    private function generateCustomerCode(): string
    {
        return 'CUS-' . strtoupper(uniqid());
    }
}
