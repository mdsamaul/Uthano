<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    /**
     * List all users with their roles and effective permissions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->with(['roles.permissions', 'permissions'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search');
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('role'), function ($q) use ($request) {
                $q->whereHas('roles', fn ($r) => $r->where('slug', $request->string('role')));
            });

        $users = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Users fetched successfully',
            UserResource::collection($users),
            [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ]
        );
    }

    /**
     * Show a single user with roles, direct permissions and effective permissions.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with(['roles.permissions', 'permissions'])->findOrFail($id);

        return ApiResponse::success('User fetched successfully', new UserResource($user));
    }

    /**
     * Assign roles to a user.
     * Body: { "roles": ["admin", "staff"] }
     */
    public function updateRoles(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'roles' => ['required', 'array'],
            'roles.*' => ['required', 'string', 'exists:roles,slug'],
        ]);

        $user = User::with(['roles.permissions', 'permissions'])->findOrFail($id);

        // Protect the last super admin from losing their role
        if (in_array('superadmin', $user->roles->pluck('slug')->all(), true)
            && !in_array('superadmin', $validated['roles'], true)) {
            $superAdminCount = User::whereHas('roles', fn ($q) => $q->where('slug', 'superadmin'))->count();
            if ($superAdminCount <= 1) {
                return ApiResponse::error('The last super admin cannot have the superadmin role removed.', 422);
            }
        }

        $user->syncRoles($validated['roles']);

        return ApiResponse::success('User roles updated successfully', new UserResource($user->load(['roles.permissions', 'permissions'])));
    }

    /**
     * Sync the direct permissions assigned to a user.
     * Body: { "permissions": [1, 2, 3] } (permission ids)
     */
    public function updatePermissions(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $user = User::with(['roles.permissions', 'permissions'])->findOrFail($id);

        $user->syncPermissions($validated['permissions'] ?? []);

        return ApiResponse::success('User permissions updated successfully', new UserResource($user->fresh(['roles.permissions', 'permissions'])));
    }

    /**
     * Create a new user (admin/staff/etc) with roles and optional permissions.
     * Body: { name, email, phone, password, is_active?, roles?, permissions? }
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8'],
            'is_active' => ['sometimes', 'boolean'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['required', 'string', 'exists:roles,slug'],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (!empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        if (!empty($validated['permissions'])) {
            $user->syncPermissions($validated['permissions']);
        }

        return ApiResponse::created(
            'User created successfully',
            new UserResource($user->load(['roles.permissions', 'permissions']))
        );
    }

    /**
     * Update a user's basic details.
     * Body: { name?, email?, phone?, password?, is_active? }
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::with(['roles.permissions', 'permissions'])->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone,' . $user->id],
            'password' => ['sometimes', 'string', 'min:8'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $user->update($validated);

        return ApiResponse::success('User updated successfully', new UserResource($user->fresh(['roles.permissions', 'permissions'])));
    }

    /**
     * Toggle a user's active status (soft deactivate/activate).
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        $user = User::with(['roles.permissions', 'permissions'])->findOrFail($id);

        // Never allow deactivating the current user or the last super admin.
        if ($user->id === $request->user()->id) {
            return ApiResponse::error('You cannot deactivate your own account.', 422);
        }

        if ($user->isSuperAdmin()) {
            $superAdminCount = User::whereHas('roles', fn ($q) => $q->where('slug', 'superadmin'))->count();
            if ($superAdminCount <= 1) {
                return ApiResponse::error('The last super admin cannot be deactivated.', 422);
            }
        }

        $user->update(['is_active' => !$user->is_active]);

        return ApiResponse::success($user->is_active ? 'User activated successfully' : 'User deactivated successfully', new UserResource($user));
    }

    /**
     * Delete a user permanently (protects super admins and self-deletion).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return ApiResponse::error('You cannot delete your own account.', 422);
        }

        if ($user->isSuperAdmin()) {
            $superAdminCount = User::whereHas('roles', fn ($q) => $q->where('slug', 'superadmin'))->count();
            if ($superAdminCount <= 1) {
                return ApiResponse::error('The last super admin cannot be deleted.', 422);
            }
        }

        $user->roles()->detach();
        $user->permissions()->detach();
        $user->tokens()->delete();
        $user->delete();

        return ApiResponse::noContent();
    }
}
