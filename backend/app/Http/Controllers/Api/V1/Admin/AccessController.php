<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
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
            'roles' => $user->roles()->pluck('roles.slug')->push($user->role)->unique()->values()->toArray(),
            'is_superadmin' => $user->isSuperAdmin(),
            'is_admin' => $user->hasAdminAccess(),
            'permissions' => $user->allPermissions()->toArray(),
        ]);
    }

    /**
     * Return the full roles + permissions catalog (grouped by module).
     * Used by the superadmin-only Admins & Roles pages for the permission checklist.
     */
    public function catalog(): JsonResponse
    {
        $roles = Role::with('permissions')->orderBy('id')->get()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'permissions' => $role->permissions->pluck('slug'),
        ]);

        $permissions = Permission::orderBy('id')->get()->groupBy('group');

        return ApiResponse::success('Access catalog fetched successfully', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }
}