<?php

namespace Database\Factories;

use App\Models\CustomerProfile;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductReview>
 */
class ProductReviewFactory extends Factory
{
    protected $model = ProductReview::class;

    public function definition(): array
    {
        return [
            'customer_id' => CustomerProfile::factory(),
            'product_id' => Product::factory(),
            'rating' => $this->faker->numberBetween(1, 5),
            'title' => $this->faker->sentence(3),
            'comment' => $this->faker->paragraph(),
            'status' => 'PENDING',
        ];
    }
}