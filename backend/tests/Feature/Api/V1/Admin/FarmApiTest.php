<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Farm;
use App\Models\Farmer;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FarmApiTest extends TestCase
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

        $farmPermissionIds = \App\Models\Permission::whereIn('slug', [
            'farm.view', 'farm.create', 'farm.update', 'farm.delete',
        ])->pluck('id')->all();

        $user->syncPermissions($farmPermissionIds);

        return $user;
    }

    private function actingAsUserWithoutPermission(): User
    {
        // Fresh user with no role and no direct permissions.
        $user = User::factory()->create();
        $user->syncRoles([]);
        $user->syncPermissions([]);

        return $user;
    }

    private function makeFarmPayload(int $farmerId): array
    {
        return [
            'farmer_id' => $farmerId,
            'farm_name' => 'Test Green Farm',
            'division' => 'Khulna',
            'district' => 'Jhenaidah',
            'upazila' => 'Shailkupa',
            'union' => 'Uthali',
            'village' => 'Moheshpur',
            'address' => 'Village Road 12',
            'latitude' => 23.7,
            'longitude' => 89.1,
            'land_area' => 6.5,
            'land_area_unit' => 'bigha',
            'soil_type' => 'Loamy',
            'irrigation_type' => 'Drip',
            'farming_method' => 'Organic',
            'status' => 'ACTIVE',
            'verification_status' => 'VERIFIED',
            'notes' => 'Demo farm for tests',
        ];
    }

    public function test_superadmin_can_list_farms_with_items_array(): void
    {
        $admin = $this->actingAsAdmin();
        $farmer = Farmer::factory()->create();
        Farm::factory()->count(2)->create(['farmer_id' => $farmer->id]);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/farms');

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Farms fetched successfully'])
            ->assertJsonCount(2, 'data.items')
            ->assertJsonStructure([
                'data' => [
                    'items' => ['*' => ['id', 'farm_code', 'farm_name', 'district', 'status']],
                    'meta',
                ],
            ]);
    }

    public function test_superadmin_can_create_farm(): void
    {
        $admin = $this->actingAsAdmin();
        $farmer = Farmer::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/farms', $this->makeFarmPayload($farmer->id));

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Farm created successfully',
                'data' => [
                    'farm_name' => 'Test Green Farm',
                    'status' => 'ACTIVE',
                    'verification_status' => 'VERIFIED',
                    'farmer' => ['id' => $farmer->id],
                ],
            ]);

        $this->assertDatabaseHas('farms', ['farm_name' => 'Test Green Farm', 'farmer_id' => $farmer->id]);
        $this->assertNotNull($response->json('data.farm_code'));
    }

    public function test_superadmin_can_show_farm_detail(): void
    {
        $admin = $this->actingAsAdmin();
        $farm = Farm::factory()->create();

        $response = $this->actingAs($admin)->getJson("/api/v1/admin/farms/{$farm->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Farm fetched successfully',
                'data' => ['id' => $farm->id, 'farm_name' => $farm->farm_name],
            ])
            ->assertJsonStructure(['data' => ['id', 'farm_code', 'farm_name', 'farmer']]);
    }

    public function test_superadmin_can_update_farm(): void
    {
        $admin = $this->actingAsAdmin();
        $farm = Farm::factory()->create();
        $newFarmer = Farmer::factory()->create();

        $payload = $this->makeFarmPayload($newFarmer->id);
        $payload['farm_name'] = 'Updated Agro Farm';
        $payload['status'] = 'INACTIVE';

        $response = $this->actingAs($admin)->putJson("/api/v1/admin/farms/{$farm->id}", $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Farm updated successfully',
                'data' => [
                    'id' => $farm->id,
                    'farm_name' => 'Updated Agro Farm',
                    'status' => 'INACTIVE',
                    'farmer' => ['id' => $newFarmer->id],
                ],
            ]);

        $this->assertDatabaseHas('farms', ['id' => $farm->id, 'farm_name' => 'Updated Agro Farm', 'status' => 'INACTIVE']);
    }

    public function test_superadmin_can_delete_farm(): void
    {
        $admin = $this->actingAsAdmin();
        $farm = Farm::factory()->create();

        $this->actingAs($admin)->deleteJson("/api/v1/admin/farms/{$farm->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('farms', ['id' => $farm->id]);
    }

    public function test_user_without_farm_permission_is_denied(): void
    {
        $user = $this->actingAsUserWithoutPermission();

        $this->actingAs($user)->getJson('/api/v1/admin/farms')
            ->assertStatus(403);
    }
}