<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Permission;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Full CRUD coverage for the superadmin user-management flow that the
 * "Admins" page (/admin/admins) depends on.
 */
class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function superAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        return $user;
    }

    public function test_superadmin_can_create_admin_user_with_roles_and_permissions(): void
    {
        $permissions = Permission::whereIn('slug', ['product.view', 'product.create'])->get();

        $response = $this->actingAs($this->superAdmin())
            ->postJson('/api/v1/admin/users', [
                'name' => 'New Admin',
                'email' => 'new-admin@uthano.com',
                'phone' => '01700000222',
                'password' => 'secret-pass',
                'is_active' => true,
                'roles' => ['admin'],
                'permissions' => $permissions->pluck('id')->all(),
            ]);

        $response->assertCreated()
            ->assertJsonFragment(['message' => 'User created successfully'])
            ->assertJsonPath('data.email', 'new-admin@uthano.com')
            ->assertJsonPath('data.roles.0', 'admin')
            ->assertJsonPath('data.is_superadmin', false);

        $userId = User::where('email', 'new-admin@uthano.com')->value('id');
        $this->assertDatabaseHas('users', ['id' => $userId]);
        $this->assertDatabaseHas('permission_user', [
            'permission_id' => $permissions->first()->id,
            'user_id' => $userId,
        ]);
    }

    public function test_superadmin_can_list_users_with_roles_and_permissions(): void
    {
        $staff = User::factory()->create(['name' => 'Visible Staff']);
        $staff->assignRole('staff');
        $staff->givePermissionTo('product.view');

        $this->actingAs($this->superAdmin())
            ->getJson('/api/v1/admin/users')
            ->assertOk()
            ->assertJsonStructure(['data' => ['items', 'meta' => ['current_page', 'per_page', 'total']]])
            ->assertJsonPath('data.meta.total', 2);

        $this->actingAs($this->superAdmin())
            ->getJson("/api/v1/admin/users/{$staff->id}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Visible Staff')
            ->assertJsonPath('data.roles.0', 'staff')
            ->assertJsonPath('data.is_superadmin', false);
    }

    public function test_superadmin_can_update_user_basics(): void
    {
        $user = User::factory()->create();

        $this->actingAs($this->superAdmin())
            ->putJson("/api/v1/admin/users/{$user->id}", [
                'name' => 'Renamed Admin',
                'is_active' => false,
            ])
            ->assertOk();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Renamed Admin',
            'is_active' => false,
        ]);
    }

    public function test_superadmin_can_update_user_roles(): void
    {
        $user = User::factory()->create();
        $user->assignRole('staff');

        $this->actingAs($this->superAdmin())
            ->putJson("/api/v1/admin/users/{$user->id}/roles", ['roles' => ['admin']])
            ->assertOk()
            ->assertJsonPath('data.roles.0', 'admin');

        $this->assertTrue($user->fresh()->hasRole('admin'));
        $this->assertFalse($user->fresh()->hasRole('staff'));
    }

    public function test_superadmin_can_update_user_permissions(): void
    {
        $user = User::factory()->create();
        $permissions = Permission::whereIn('slug', ['product.view', 'order.view'])->get();

        // Regression: this endpoint previously returned 500 because the
        // controller method did not exist.
        $this->actingAs($this->superAdmin())
            ->putJson("/api/v1/admin/users/{$user->id}/permissions", [
                'permissions' => $permissions->pluck('id')->all(),
            ])
            ->assertOk()
            ->assertJsonFragment(['message' => 'User permissions updated successfully']);

        $this->assertEqualsCanonicalizing(
            $permissions->pluck('slug')->all(),
            $user->fresh('permissions')->permissions->pluck('slug')->all()
        );
    }

    public function test_superadmin_can_clear_user_permissions(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('product.view');

        $this->actingAs($this->superAdmin())
            ->putJson("/api/v1/admin/users/{$user->id}/permissions", ['permissions' => []])
            ->assertOk();

        $this->assertCount(0, $user->fresh('permissions')->permissions);
    }

    public function test_superadmin_can_toggle_user_status(): void
    {
        $user = User::factory()->create();

        $this->actingAs($this->superAdmin())
            ->postJson("/api/v1/admin/users/{$user->id}/toggle")
            ->assertOk();

        $this->assertFalse($user->fresh()->is_active);

        $this->actingAs($this->superAdmin())
            ->postJson("/api/v1/admin/users/{$user->id}/toggle")
            ->assertOk();

        $this->assertTrue($user->fresh()->is_active);
    }

    public function test_superadmin_can_delete_user(): void
    {
        $user = User::factory()->create();
        $user->assignRole('staff');

        $this->actingAs($this->superAdmin())
            ->deleteJson("/api/v1/admin/users/{$user->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('role_user', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('permission_user', ['user_id' => $user->id]);
    }

    public function test_cannot_delete_own_account(): void
    {
        $superAdmin = $this->superAdmin();

        $this->actingAs($superAdmin)
            ->deleteJson("/api/v1/admin/users/{$superAdmin->id}")
            ->assertStatus(422);
    }

    public function test_cannot_deactivate_own_account(): void
    {
        $superAdmin = $this->superAdmin();

        $this->actingAs($superAdmin)
            ->postJson("/api/v1/admin/users/{$superAdmin->id}/toggle")
            ->assertStatus(422);
    }

    public function test_cannot_remove_last_superadmin_role(): void
    {
        $superAdmin = $this->superAdmin();

        $this->actingAs($superAdmin)
            ->putJson("/api/v1/admin/users/{$superAdmin->id}/roles", ['roles' => ['admin']])
            ->assertStatus(422);

        $this->assertTrue($superAdmin->fresh()->hasRole('superadmin'));
    }

    public function test_non_superadmin_without_user_permissions_is_forbidden(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        $this->actingAs($staff)
            ->postJson('/api/v1/admin/users', [
                'name' => 'Sneaky Admin',
                'email' => 'sneaky@uthano.com',
                'password' => 'secret-pass',
            ])
            ->assertForbidden();
    }
}