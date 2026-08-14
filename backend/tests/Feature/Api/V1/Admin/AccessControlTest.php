<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Product;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function actingAsSuperAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        return $user;
    }

    private function actingAsAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    private function actingAsStaff(): User
    {
        $user = User::factory()->create();
        $user->assignRole('staff');

        return $user;
    }

    private function actingAsCustomer(): User
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        return $user;
    }

    public function test_unauthenticated_user_cannot_access_admin_routes(): void
    {
        $this->get('/api/v1/admin/dashboard')
            ->assertStatus(401);
    }

    public function test_user_without_admin_role_is_forbidden(): void
    {
        $customer = $this->actingAsCustomer();

        $this->actingAs($customer)
            ->get('/api/v1/admin/dashboard')
            ->assertStatus(403);
    }

    public function test_staff_can_access_route_they_have_permission_for(): void
    {
        $staff = $this->actingAsStaff();

        $this->actingAs($staff)
            ->get('/api/v1/admin/products')
            ->assertStatus(200);
    }

    public function test_staff_cannot_access_route_they_lack_permission_for(): void
    {
        $staff = $this->actingAsStaff();

        // Staff lacks the `product.delete` permission -> middleware blocks with 403.
        $this->actingAs($staff)
            ->delete('/api/v1/admin/products/1')
            ->assertStatus(403);
    }

    public function test_staff_cannot_access_superadmin_only_endpoints(): void
    {
        $staff = $this->actingAsStaff();

        // Staff has no `user.manage` OR `role.manage` permission -> 403.
        $this->actingAs($staff)
            ->get('/api/v1/admin/users')
            ->assertStatus(403);

        $this->actingAs($staff)
            ->get('/api/v1/admin/roles')
            ->assertStatus(403);
    }

    public function test_superadmin_bypasses_all_role_and_permission_checks(): void
    {
        $superAdmin = $this->actingAsSuperAdmin();

        $this->actingAs($superAdmin)
            ->get('/api/v1/admin/audit-logs')
            ->assertStatus(200);

        $this->actingAs($superAdmin)
            ->get('/api/v1/admin/users')
            ->assertStatus(200);

                // Superadmin bypasses role + permission checks; create a real product so the
        // controller resolves the resource and returns 204 after deletion.
        $product = Product::factory()->create();

        $this->actingAs($superAdmin)
            ->delete('/api/v1/admin/products/' . $product->id)
            ->assertStatus(204);
    }

    public function test_access_my_endpoint_returns_user_roles_and_permissions(): void
    {
        $admin = $this->actingAsAdmin();

        $this->actingAs($admin)
            ->get('/api/v1/admin/access/my')
            ->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['role', 'roles', 'is_superadmin', 'permissions'],
            ]);
    }

            public function test_access_catalog_is_restricted_by_role_or_permission(): void
    {
        // Superadmin can reach the catalog (comma-separated super-admin bypass + permission OR).
        $superAdmin = $this->actingAsSuperAdmin();
        $this->actingAs($superAdmin)
            ->get('/api/v1/admin/access/catalog')
            ->assertStatus(200);

        // Staff lacks both `user.manage` and `role.manage` -> 403.
        $staff = $this->actingAsStaff();
        $this->actingAs($staff)
            ->get('/api/v1/admin/access/catalog')
            ->assertStatus(403);
    }

    // --- Permission-based access enforcement ---

    public function test_non_superadmin_admin_is_denied_privileged_module_access(): void
    {
        // The `admin` role now grants only `dashboard.view` by default — every
        // other module is locked down until permissions are assigned. This proves
        // that being an "admin" does not imply blanket access.
        $admin = $this->actingAsAdmin();

        $this->actingAs($admin)->get('/api/v1/admin/roles')->assertStatus(403);
        $this->actingAs($admin)->get('/api/v1/admin/coupons')->assertStatus(403);
        $this->actingAs($admin)->get('/api/v1/admin/audit-logs')->assertStatus(403);
    }

    public function test_superadmin_is_the_only_role_with_unrestricted_access(): void
    {
        // Superadmin bypasses every permission check, including the privileged
        // modules that the plain `admin` role is denied above.
        $superAdmin = $this->actingAsSuperAdmin();

        $this->actingAs($superAdmin)->get('/api/v1/admin/roles')->assertStatus(200);
        $this->actingAs($superAdmin)->get('/api/v1/admin/coupons')->assertStatus(200);
        $this->actingAs($superAdmin)->get('/api/v1/admin/audit-logs')->assertStatus(200);
    }
}
