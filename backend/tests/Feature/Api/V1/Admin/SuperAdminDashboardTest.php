<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Verifies every endpoint the superadmin dashboard page (/admin) renders:
 * summary, stats, sales-chart, top-products and top-farms.
 */
class SuperAdminDashboardTest extends TestCase
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

    public function test_dashboard_summary_returns_full_structure(): void
    {
        $this->actingAs($this->superAdmin())
            ->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'total_customers',
                    'total_farmers',
                    'total_farms',
                    'total_products',
                    'active_products',
                    'today_orders',
                    'pending_orders',
                    'total_sales',
                    'today_sales',
                    'total_inventory_quantity',
                    'available_inventory_quantity',
                    'low_stock_products',
                    'expiring_batches',
                    'damaged_quantity',
                    'top_products',
                    'top_farmers',
                ],
            ]);
    }

    public function test_dashboard_stats_returns_stat_cards(): void
    {
        $this->actingAs($this->superAdmin())
            ->getJson('/api/v1/admin/dashboard/stats')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'total_sales',
                    'today_orders',
                    'pending_orders',
                    'total_customers',
                    'total_farmers',
                    'total_products',
                    'low_stock_products',
                    'pending_deliveries',
                ],
            ]);
    }

    public function test_dashboard_sales_chart_includes_delivered_orders(): void
    {
        Order::factory()->create([
            'order_status' => 'DELIVERED',
            'total' => 5000,
            'placed_at' => now(),
        ]);

        $this->actingAs($this->superAdmin())
            ->getJson('/api/v1/admin/dashboard/sales-chart?days=30')
            ->assertOk()
            ->assertJsonStructure(['data' => [['date', 'sales']]])
            // The chart is ordered oldest -> newest, so today (index 29) carries
            // the sales from the delivered order created above.
            ->assertJsonPath('data.29.sales', 5000);
    }

    public function test_dashboard_sales_chart_is_days_aware(): void
    {
        Order::factory()->create([
            'order_status' => 'DELIVERED',
            'total' => 100,
            'placed_at' => now()->subDays(45),
        ]);

        $response = $this->actingAs($this->superAdmin())
            ->getJson('/api/v1/admin/dashboard/sales-chart?days=7')
            ->assertOk();

        $this->assertCount(7, $response->json('data'));
    }

    public function test_dashboard_top_products_returns_ordering(): void
    {
        $product = Product::factory()->create(['name' => 'Top Guava']);
        $order = Order::factory()->create(['order_status' => 'DELIVERED']);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => 'Top Guava',
            'sku' => $product->sku,
            'quantity' => 10,
            'unit_id' => $product->unit_id,
            'unit_price' => 100,
            'total' => 1000,
        ]);

        $this->actingAs($this->superAdmin())
            ->getJson('/api/v1/admin/dashboard/top-products?limit=5')
            ->assertOk()
            ->assertJsonStructure(['data' => [['product_id', 'product_name', 'total_quantity', 'total_sales']]])
            ->assertJsonPath('data.0.product_name', 'Top Guava');
    }

    public function test_dashboard_top_farms_returns_array(): void
    {
        $this->actingAs($this->superAdmin())
            ->getJson('/api/v1/admin/dashboard/top-farms?limit=5')
            ->assertOk()
            ->assertJsonIsArray('data');
    }

    public function test_user_without_dashboard_permission_is_forbidden(): void
    {
        // The seeded `admin` role only grants `dashboard.view` by default —
        // detach it to prove the permission middleware protects the endpoint.
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $admin->roles()->first()->permissions()->detach();

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/dashboard/stats')
            ->assertForbidden();
    }
}