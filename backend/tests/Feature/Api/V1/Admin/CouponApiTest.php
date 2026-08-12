<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Coupon;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function actingAsAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    public function test_admin_can_list_coupons(): void
    {
        $admin = $this->actingAsAdmin();
        Coupon::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/api/v1/admin/coupons');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Coupons fetched successfully',
            ]);
    }

    public function test_admin_can_create_coupon(): void
    {
        $admin = $this->actingAsAdmin();

        $payload = [
            'code' => 'TEST20',
            'type' => 'PERCENTAGE',
            'value' => 20,
            'minimum_order_amount' => 100,
            'maximum_discount' => 50,
            'start_at' => now()->toDateString(),
            'end_at' => now()->addDays(30)->toDateString(),
            'usage_limit' => 100,
            'per_customer_limit' => 1,
            'is_active' => true,
        ];

        $response = $this->actingAs($admin)->post('/api/v1/admin/coupons', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Coupon created successfully',
            ]);

        $this->assertDatabaseHas('coupons', ['code' => 'TEST20']);
    }

    public function test_admin_can_toggle_coupon_status(): void
    {
        $admin = $this->actingAsAdmin();
        $coupon = Coupon::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin)->post("/api/v1/admin/coupons/{$coupon->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Coupon status updated successfully',
            ]);

        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'is_active' => false]);
    }
}