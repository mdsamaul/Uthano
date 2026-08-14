<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleAdminController extends Controller
{
    /**
     * List all roles with their assigned permission slugs.
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->withCount('users')->orderBy('id')->get();

        return ApiResponse::success('Roles fetched successfully', $roles->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'users_count' => $role->users_count,
            'permissions' => $role->permissions->pluck('slug'),
        ]));
    }

    /**
     * Show a single role with its permissions and users count.
     */
    public function show(int $id): JsonResponse
    {
        $role = Role::with('permissions')->findOrFail($id);

        return ApiResponse::success('Role fetched successfully', [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'permissions' => $role->permissions->pluck('slug'),
        ]);
    }

    /**
     * Update the permissions assigned to a role.
     * Body: { "permissions": [1, 2, 3] } (permission ids)
     */
    public function updatePermissions(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role = Role::findOrFail($id);

        $role->permissions()->sync($validated['permissions'] ?? []);

        return ApiResponse::success('Role permissions updated successfully', [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'permissions' => $role->fresh('permissions')->permissions->pluck('slug'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:roles,slug'],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
        ]);

        if (!empty($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return ApiResponse::created('Role created successfully', [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'permissions' => $role->fresh('permissions')->permissions->pluck('slug'),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash', 'unique:roles,slug,' . $role->id],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role->update([
            'name' => $validated['name'] ?? $role->name,
            'slug' => $validated['slug'] ?? $role->slug,
            'description' => array_key_exists('description', $validated)
                ? ($validated['description'] ?? null)
                : $role->description,
        ]);

        if (array_key_exists('permissions', $validated)) {
            $role->permissions()->sync($validated['permissions'] ?? []);
        }

        return ApiResponse::success('Role updated successfully', [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'permissions' => $role->fresh('permissions')->permissions->pluck('slug'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        if ($role->slug === 'superadmin') {
            return ApiResponse::error('The superadmin role cannot be deleted.', 422);
        }

        if ($role->users()->exists()) {
            return ApiResponse::error('This role cannot be deleted because it is assigned to users.', 422);
        }

        $role->permissions()->detach();
        $role->delete();

        return ApiResponse::noContent();
    }
}