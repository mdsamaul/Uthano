<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function actingAsAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        return $admin;
    }

    public function test_public_can_list_products(): void
    {
        Product::factory()->count(3)->create();

        $response = $this->get('/api/v1/products');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Products fetched successfully',
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_public_can_view_single_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->get("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Product fetched successfully',
            ])
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.name', $product->name);
    }

    public function test_admin_can_create_product(): void
    {
        $admin = $this->actingAsAdmin();
        $category = Category::factory()->create();
        $unit = Unit::factory()->create();

        $payload = [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'sku' => 'TEST-SKU-001',
            'product_type' => 'FRESH',
            'base_price' => 100,
            'selling_price' => 120,
            'cost_price' => 80,
            'minimum_order_quantity' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($admin)->post('/api/v1/admin/products', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Product created successfully',
            ])
            ->assertJsonPath('data.name', 'Test Product');

        $this->assertDatabaseHas('products', ['slug' => 'test-product']);
    }

    public function test_admin_can_update_product(): void
    {
        $admin = $this->actingAsAdmin();
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)->put("/api/v1/admin/products/{$product->id}", [
            'category_id' => $product->category_id,
            'unit_id' => $product->unit_id,
            'name' => 'Updated Product Name',
            'slug' => $product->slug . '-updated',
            'sku' => $product->sku . '-UPD',
            'product_type' => 'FRESH',
            'base_price' => 150,
            'selling_price' => 180,
            'cost_price' => 100,
            'minimum_order_quantity' => 1,
            'status' => 'ACTIVE',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Product Name');

        $this->assertDatabaseHas('products', ['name' => 'Updated Product Name']);
    }

    public function test_admin_can_delete_product(): void
    {
        $admin = $this->actingAsAdmin();
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)->delete("/api/v1/admin/products/{$product->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_guest_cannot_create_product(): void
    {
        $category = Category::factory()->create();
        $unit = Unit::factory()->create();

        $response = $this->post('/api/v1/admin/products', [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'Unauthorized Product',
            'slug' => 'unauthorized-product',
            'sku' => 'UNAUTH-001',
            'product_type' => 'FRESH',
            'base_price' => 100,
            'selling_price' => 120,
            'cost_price' => 80,
            'minimum_order_quantity' => 1,
            'status' => 'ACTIVE',
        ]);

        $response->assertStatus(401);
    }
}