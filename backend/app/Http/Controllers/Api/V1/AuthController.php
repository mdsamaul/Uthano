<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Services\OtpService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;


class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return ApiResponse::created('Registration successful', [
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return ApiResponse::success('Login successful', [
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return ApiResponse::success('Logged out successfully');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['customerProfile', 'farmer']);

        return ApiResponse::success('Current user fetched successfully', new UserResource($user));
    }

    public function requestOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^[0-9+\-\s]{8,20}$/'],
        ]);

        $result = $this->authService->requestOtp($validated['phone']);

        return ApiResponse::success('OTP sent successfully.', $result);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^[0-9+\-\s]{8,20}$/'],
            'otp' => ['required', 'string', 'digits:6'],
        ]);

        $result = $this->authService->verifyOtp($validated['phone'], $validated['otp']);

        return ApiResponse::success('OTP verified successfully. Welcome!', [
            'user' => new UserResource($result['user']->load(['roles', 'customerProfile'])),
            'token' => $result['token'],
        ]);
    }
}