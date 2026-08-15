<?php

namespace App\Models;

use App\Models\Permission;
use App\Models\Role;
use Database\Factories\UserFactory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'is_active',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if user has a specific role (using simple role field)
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    /**
     * Check if user is admin (superadmin or admin)
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['superadmin', 'admin']);
    }

    /**
     * Check if user is farmer
     */
    public function isFarmer(): bool
    {
        return $this->role === 'farmer';
    }

    /**
     * Check if user is customer
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function customerProfile(): HasOne
    {
        return $this->hasOne(CustomerProfile::class);
    }

    public function farmer(): HasOne
    {
        return $this->hasOne(Farmer::class);
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class, 'customer_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Simple role-based access without complex permissions
     * Admins (superadmin, admin, staff, warehouse_manager) have admin access
     */
    public function hasAdminAccess(): bool
    {
        return in_array($this->role, ['superadmin', 'admin', 'staff', 'warehouse_manager']);
    }

    // ============================================
    // RBAC: Roles & Permissions (many-to-many)
    // ============================================

    /**
     * Roles assigned to the user through the role_user pivot table.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * Permissions directly assigned to the user (permission_user pivot).
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }

    /**
     * Permissions granted by the user's role (role column mapped to the roles table).
     */
    public function rolePermissions()
    {
        if (! $this->role) {
            return collect();
        }

        $role = Role::where('slug', $this->role)->with('permissions')->first();

        return $role ? collect($role->permissions->pluck('slug')) : collect();
    }

    /**
     * All effective permission slugs: role-based + directly assigned.
     */
    public function allPermissions()
    {
        $slugs = $this->rolePermissions();

        return $slugs->merge($this->permissions()->pluck('permissions.slug'))->unique()->values();
    }

    /**
     * Check whether the user has a permission (superadmin always bypasses).
     * All other users must hold the permission either through their role or
     * from direct assignment.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->allPermissions()->contains($permission);
    }

    /**
     * Sync the roles (by slug) assigned to the user and keep the simple
     * `role` column in sync with the primary role.
     */
    public function syncRoles(array $roleSlugs): void
    {
        $roleSlugs = array_values(array_filter(array_unique($roleSlugs)));

        if (empty($roleSlugs)) {
            $this->roles()->sync([]);
            $this->role = null;

            return;
        }

        $roleIds = Role::whereIn('slug', $roleSlugs)->pluck('id');
        $this->roles()->sync($roleIds);

        $this->role = $roleSlugs[0];
    }

    /**
     * Sync the permissions directly assigned to the user (by permission id).
     */
    public function syncPermissions(array $permissionIds): void
    {
        $this->permissions()->sync(array_values(array_unique($permissionIds)));
    }
}