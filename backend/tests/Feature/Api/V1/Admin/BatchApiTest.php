<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Farm;
use App\Models\Harvest;
use App\Models\HarvestBatch;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BatchApiTest extends TestCase
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
        $user->givePermissionTo(['batch.view']);

        return $user;
    }

    // Regression for `/admin/batches` -> `data.map is not a function` (same root
    // cause as deliveries: controller passed the whole Paginator, so
    // `data.items` came back as a nested object instead of an array).
    public function test_admin_can_list_batches_returns_items_array(): void
    {
        $admin = $this->actingAsAdmin();
        $product = Product::factory()->create();
        $unit = Unit::factory()->create();
        $farm = Farm::factory()->create();

        $harvest = Harvest::create([
            'farm_id' => $farm->id,
            'product_id' => $product->id,
            'harvest_code' => 'HAR-TEST-001',
            'harvest_date' => now(),
            'actual_quantity' => 100,
            'quantity_unit_id' => $unit->id,
            'status' => 'RECORDED',
        ]);

        HarvestBatch::create([
            'harvest_id' => $harvest->id,
            'batch_code' => 'BAT-TEST-001',
            'product_id' => $product->id,
            'quantity' => 100,
            'remaining_quantity' => 100,
            'unit_id' => $unit->id,
            'harvested_at' => now(),
            'status' => 'CREATED',
        ]);

        $response = $this->actingAs($admin)->get('/api/v1/admin/batches');

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Batches fetched successfully'])
            ->assertJsonCount(1, 'data.items')
                        ->assertJsonStructure([
                'data' => [
                    'items' => ['*' => ['id', 'batch_code', 'harvest_name', 'status']],
                    'meta',
                ],
            ]);
    }
}
