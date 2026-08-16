<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Farm;
use App\Models\Harvest;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HarvestApiTest extends TestCase
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
        $user->syncRoles(['admin']);

        $permissionIds = Permission::whereIn('slug', [
            'harvest.view', 'harvest.manage',
        ])->pluck('id')->all();

        $user->syncPermissions($permissionIds);

        return $user;
    }

    private function actingAsUserWithoutPermission(): User
    {
        $user = User::factory()->create();
        $user->syncRoles([]);
        $user->syncPermissions([]);

        return $user;
    }

        private function makeHarvestPayload(int $farmId, int $productId, int $unitId): array
    {
        return [
            'farm_id' => $farmId,
            'product_id' => $productId,
            'harvest_date' => '2026-08-10',
            'estimated_quantity' => 500,
            'actual_quantity' => 500,
            'quantity_unit_id' => $unitId,
            'quality_grade' => 'A',
            'status' => 'RECORDED',
            'notes' => 'Test harvest',
        ];
    }

    public function test_superadmin_can_list_harvests_with_items_array(): void
    {
        $admin = $this->actingAsAdmin();
        $farm = Farm::factory()->create();
        $product = Product::factory()->create();
        $unit = Unit::factory()->create();
        Harvest::factory()->count(3)->create([
            'farm_id' => $farm->id,
            'product_id' => $product->id,
            'quantity_unit_id' => $unit->id,
        ]);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/harvests');

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Harvests fetched successfully'])
            ->assertJsonCount(3, 'data.items')
            ->assertJsonStructure([
                'data' => [
                    'items' => ['*' => ['id', 'harvest_code', 'harvest_date', 'actual_quantity', 'status']],
                    'meta',
                ],
            ]);
    }

    public function test_superadmin_can_create_harvest(): void
    {
        $admin = $this->actingAsAdmin();
        $farm = Farm::factory()->create();
        $product = Product::factory()->create();
        $unit = Unit::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/harvests', $this->makeHarvestPayload($farm->id, $product->id, $unit->id));

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Harvest created successfully',
            ])
            ->assertJsonStructure(['data' => ['harvest_code']]);

        $this->assertNotNull($response->json('data.harvest_code'));
        $this->assertDatabaseHas('harvests', [
            'farm_id' => $farm->id,
            'product_id' => $product->id,
            'quantity_unit_id' => $unit->id,
        ]);
    }

    public function test_superadmin_can_show_harvest_detail(): void
    {
        $admin = $this->actingAsAdmin();
        $harvest = Harvest::factory()->create();

        $response = $this->actingAs($admin)->getJson("/api/v1/admin/harvests/{$harvest->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Harvest fetched successfully',
                'data' => ['id' => $harvest->id],
            ])
            ->assertJsonStructure(['data' => ['id', 'harvest_code', 'harvest_date', 'farm', 'product']]);

        $this->assertNotNull($response->json('data.harvest_code'));
    }

    public function test_superadmin_can_update_harvest(): void
    {
        $admin = $this->actingAsAdmin();
        $harvest = Harvest::factory()->create();
        $newFarm = Farm::factory()->create();
        $newProduct = Product::factory()->create();
        $newUnit = Unit::factory()->create();

        $payload = $this->makeHarvestPayload($newFarm->id, $newProduct->id, $newUnit->id);
        $payload['actual_quantity'] = 750;
        $payload['status'] = 'BATCHED';

        $response = $this->actingAs($admin)->putJson("/api/v1/admin/harvests/{$harvest->id}", $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Harvest updated successfully',
                'data' => ['id' => $harvest->id, 'status' => 'BATCHED'],
            ]);

        $this->assertDatabaseHas('harvests', [
            'id' => $harvest->id,
            'farm_id' => $newFarm->id,
            'status' => 'BATCHED',
        ]);
    }

    public function test_superadmin_can_delete_harvest(): void
    {
        $admin = $this->actingAsAdmin();
        $harvest = Harvest::factory()->create();

        $this->actingAs($admin)->deleteJson("/api/v1/admin/harvests/{$harvest->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('harvests', ['id' => $harvest->id]);
    }

    public function test_user_without_harvest_permission_is_denied(): void
    {
        $user = $this->actingAsUserWithoutPermission();

        $this->actingAs($user)->getJson('/api/v1/admin/harvests')
            ->assertStatus(403);
    }
}
