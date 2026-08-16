<?php

namespace Tests\Feature\Api\V1;

use App\Models\CustomerAddress;
use App\Models\CustomerProfile;
use App\Models\Order;
use App\Models\Permission;
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

    public function test_customer_can_view_order_by_order_number(): void
    {
        $customer = $this->actingAsCustomer();
        $address = CustomerAddress::factory()->create([
            'customer_profile_id' => $customer->customerProfile->id,
        ]);
        $order = Order::factory()->create([
            'customer_id' => $customer->customerProfile->id,
            'address_id' => $address->id,
        ]);
        $product = Product::factory()->create();
        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'quantity' => 2,
            'unit_id' => $product->unit_id,
            'unit_price' => 50,
            'discount' => 0,
            'total' => 100,
        ]);

        $response = $this->actingAs($customer)->get("/api/v1/orders/{$order->order_number}");

        $response->assertStatus(200)
            ->assertJsonPath('data.order_number', $order->order_number)
            ->assertJsonPath('data.delivery_address.id', $address->id)
            ->assertJsonPath('data.items.0.product.id', $product->id)
            ->assertJsonPath('data.items.0.product.slug', $product->slug)
            ->assertJsonPath('data.items.0.subtotal', 100);
    }

    private function actingAsOrderAdmin(): User
    {
        $user = User::factory()->create();
        $user->syncRoles(['admin']);

        $permissionIds = Permission::whereIn('slug', [
            'order.view', 'order.update', 'order.status.update',
        ])->pluck('id')->all();

        $user->syncPermissions($permissionIds);

        return $user;
    }

    public function test_admin_can_advance_order_status_forward(): void
    {
        $admin = $this->actingAsOrderAdmin();
        $order = Order::factory()->create(['order_status' => 'PROCESSING']);

        $response = $this->actingAs($admin)->postJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => 'PACKED',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Order status updated successfully']);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'order_status' => 'PACKED']);
    }

    public function test_order_status_cannot_go_backwards(): void
    {
        $admin = $this->actingAsOrderAdmin();
        $order = Order::factory()->create(['order_status' => 'PROCESSING']);

        $this->actingAs($admin)->postJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => 'CONFIRMED',
        ])->assertStatus(422);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'order_status' => 'PROCESSING']);
    }

    public function test_order_status_cannot_skip_steps(): void
    {
        $admin = $this->actingAsOrderAdmin();
        $order = Order::factory()->create(['order_status' => 'PENDING']);

        $this->actingAs($admin)->postJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => 'DELIVERED',
        ])->assertStatus(422);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'order_status' => 'PENDING']);
    }

    public function test_terminal_order_status_is_final(): void
    {
        $admin = $this->actingAsOrderAdmin();
        $order = Order::factory()->create(['order_status' => 'CANCELLED']);

        $this->actingAs($admin)->postJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => 'DELIVERED',
        ])->assertStatus(422);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'order_status' => 'CANCELLED']);
    }
}