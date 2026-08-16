<?php

namespace Database\Factories;

use App\Models\Farm;
use App\Models\Harvest;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Harvest>
 */
class HarvestFactory extends Factory
{
    protected $model = Harvest::class;

    public function definition(): array
    {
        return [
            'farm_id' => Farm::factory(),
            'farm_crop_id' => null,
            'product_id' => Product::factory(),
                        'harvest_code' => 'HARV-' . date('Y') . '-' . str_pad((string) fake()->unique()->randomNumber(4), 4, '0', STR_PAD_LEFT),
            'harvest_date' => fake()->date(),
            'estimated_quantity' => fake()->randomFloat(2, 100, 1000),
            'actual_quantity' => fake()->randomFloat(2, 100, 1000),
            'quantity_unit_id' => Unit::factory(),
            'quality_grade' => fake()->randomElement(['A', 'B', 'C', null]),
            'status' => fake()->randomElement(['RECORDED', 'QUALITY_CHECKED', 'BATCHED', 'REJECTED']),
            'notes' => null,
        ];
    }
}
