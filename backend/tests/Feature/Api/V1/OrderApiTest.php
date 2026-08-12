<?php

namespace Tests\Feature\Api\V1;

use App\Models\CustomerAddress;
use App\Models\CustomerProfile;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function actingAsCustomer(): User
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        CustomerProfile::create([
            'user_id' => $user->id,
            'customer_code' => 'CUS-TEST-' . $user->id,
            'full_name' => $user->name,
            'phone' => '01700000000',
        ]);

        return $user;
    }

    public function test_customer_can_create_order(): void
    {
        $customer = $this->actingAsCustomer();
        $product = Product::factory()->create(['is_active' => true, 'status' => 'ACTIVE']);

        $address = CustomerAddress::factory()->create([
            'customer_profile_id' => $customer->customerProfile->id,
        ]);

        $payload = [
            'address_id' => $address->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'payment_method' => 'COD',
        ];

        $response = $this->actingAs($customer)->post('/api/v1/orders', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Order placed successfully',
            ]);

        $this->assertDatabaseHas('orders', ['customer_id' => $customer->customerProfile->id]);
    }

    public function test_customer_can_view_own_orders(): void
    {
        $customer = $this->actingAsCustomer();

        $response = $this->actingAs($customer)->get('/api/v1/orders');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Orders fetched successfully',
            ]);
    }

    public function test_guest_cannot_create_order(): void
    {
        $response = $this->post('/api/v1/orders', [
            'address_id' => 1,
            'items' => [],
        ]);

        $response->assertStatus(401);
    }
}