<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\CustomerProfile;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductReviewApiTest extends TestCase
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
        // RBAC: admins are permission-based. Grant the review-module
        // permissions this CRUD suite exercises.
        $user->givePermissionTo(['review.view', 'review.manage']);

        return $user;
    }

    public function test_admin_can_list_product_reviews(): void
    {
        $admin = $this->actingAsAdmin();
        ProductReview::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/api/v1/admin/product-reviews');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Product reviews fetched successfully',
            ]);
    }

    public function test_admin_can_create_product_review(): void
    {
        $admin = $this->actingAsAdmin();
        $product = Product::factory()->create();
        $customer = CustomerProfile::factory()->create();

        $payload = [
            'product_id' => $product->id,
            'customer_id' => $customer->id,
            'rating' => 5,
            'title' => 'Great product',
            'comment' => 'Excellent quality',
            'status' => 'PENDING',
        ];

        $response = $this->actingAs($admin)->post('/api/v1/admin/product-reviews', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Product review created successfully',
            ]);

        $this->assertDatabaseHas('product_reviews', ['product_id' => $product->id]);
    }

    public function test_admin_can_approve_product_review(): void
    {
        $admin = $this->actingAsAdmin();
        $review = ProductReview::factory()->create(['status' => 'PENDING']);

        $response = $this->actingAs($admin)->post("/api/v1/admin/product-reviews/{$review->id}/approve");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Product review approved successfully',
            ]);

        $this->assertDatabaseHas('product_reviews', ['id' => $review->id, 'status' => 'APPROVED']);
    }
}