<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Product;
use App\Models\QualityCheck;
use App\Models\User;
use App\Models\Warehouse;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QualityCheckApiTest extends TestCase
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
        // RBAC: admins are permission-based. Grant the quality-check-module
        // permissions this CRUD suite exercises.
        $user->givePermissionTo([
            'quality-check.view', 'quality-check.manage',
        ]);

        return $user;
    }

    public function test_admin_can_list_quality_checks(): void
    {
        $admin = $this->actingAsAdmin();
        QualityCheck::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/api/v1/admin/quality-checks');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Quality checks fetched successfully',
            ]);
    }

    public function test_admin_can_create_quality_check(): void
    {
        $admin = $this->actingAsAdmin();
        $product = Product::factory()->create();
        $warehouse = Warehouse::factory()->create();

        $payload = [
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'appearance' => 'Good',
            'freshness' => 'Fresh',
            'damaged_quantity' => 0,
            'accepted_quantity' => 100,
            'rejected_quantity' => 0,
            'grade' => 'A',
            'status' => 'PENDING',
        ];

        $response = $this->actingAs($admin)->post('/api/v1/admin/quality-checks', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Quality check created successfully',
            ]);

        $this->assertDatabaseHas('quality_checks', ['product_id' => $product->id]);
    }

    public function test_admin_can_approve_quality_check(): void
    {
        $admin = $this->actingAsAdmin();
        $qualityCheck = QualityCheck::factory()->create(['status' => 'PENDING']);

        $response = $this->actingAs($admin)->post("/api/v1/admin/quality-checks/{$qualityCheck->id}/approve");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Quality check approved successfully',
            ]);

        $this->assertDatabaseHas('quality_checks', ['id' => $qualityCheck->id, 'status' => 'APPROVED']);
    }

    public function test_admin_can_reject_quality_check(): void
    {
        $admin = $this->actingAsAdmin();
        $qualityCheck = QualityCheck::factory()->create(['status' => 'PENDING']);

        $response = $this->actingAs($admin)->post("/api/v1/admin/quality-checks/{$qualityCheck->id}/reject", [
            'reason' => 'Does not meet quality standards',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Quality check rejected successfully',
            ]);

        $this->assertDatabaseHas('quality_checks', ['id' => $qualityCheck->id, 'status' => 'REJECTED']);
    }
}