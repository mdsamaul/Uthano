<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return ApiResponse::created('Registration successful', [
            'user' => new UserResource($result['user']->load(['roles', 'customerProfile'])),
            'token' => $result['token'],
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return ApiResponse::success('Login successful', [
            'user' => new UserResource($result['user']->load(['roles', 'customerProfile'])),
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
        $user = $request->user()->load(['roles', 'customerProfile', 'farmer']);

        return ApiResponse::success('Current user fetched successfully', new UserResource($user));
    }
}