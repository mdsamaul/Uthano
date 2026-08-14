<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Delivery;
use App\Models\Order;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeliveryApiTest extends TestCase
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
        $user->givePermissionTo(['delivery.view']);

        return $user;
    }

    // Regression for `/admin/deliveries` -> `data.map is not a function`:
    // the controller used to pass the whole Paginator into ApiResponse::paginated,
    // which JSON-serialized `data.items` as a NESTED object ({data,meta,links})
    // instead of an array, so the frontend's `items.map()` crashed.
    public function test_admin_can_list_deliveries_returns_items_array(): void
    {
        $admin = $this->actingAsAdmin();
        $order = Order::factory()->create();
        Delivery::create([
            'order_id' => $order->id,
            'delivery_code' => 'DEL-TEST-001',
            'status' => 'PENDING',
        ]);

        $response = $this->actingAs($admin)->get('/api/v1/admin/deliveries');

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Deliveries fetched successfully'])
            ->assertJsonCount(1, 'data.items')
                        ->assertJsonStructure([
                'data' => [
                    'items' => ['*' => ['id', 'delivery_code', 'order_number', 'status']],
                    'meta',
                ],
            ]);
    }
}
