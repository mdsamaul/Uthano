<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessController extends Controller
{
    /**
     * Return the authenticated user's role information.
     * Frontend uses this to decide which admin pages/actions to show.
     */
    public function myAccess(Request $request): JsonResponse
    {
        $user = $request->user();

        return ApiResponse::success('My access fetched successfully', [
            'role' => $user->role,
            'is_superadmin' => $user->isSuperAdmin(),
            'is_admin' => $user->hasAdminAccess(),
        ]);
    }
}