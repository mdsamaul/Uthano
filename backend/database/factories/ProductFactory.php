<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'category_id' => Category::factory(),
            'unit_id' => Unit::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'short_description' => fake()->sentence(),
            'sku' => 'SKU-' . strtoupper(Str::random(8)),
            'product_type' => 'FRESH',
            'base_price' => fake()->randomFloat(2, 20, 200),
            'selling_price' => fake()->randomFloat(2, 30, 300),
            'cost_price' => fake()->randomFloat(2, 10, 150),
            'minimum_order_quantity' => 1,
            'maximum_order_quantity' => null,
            'stock_tracking' => true,
            'is_featured' => fake()->boolean(20),
            'is_active' => true,
            'status' => 'ACTIVE',
        ];
    }
}