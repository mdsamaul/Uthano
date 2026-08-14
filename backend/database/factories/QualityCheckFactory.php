<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\QualityCheck;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QualityCheck>
 */
class QualityCheckFactory extends Factory
{
    protected $model = QualityCheck::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'warehouse_id' => Warehouse::factory(),
            'checked_by' => User::factory(),
            'checked_at' => now(),
            'appearance' => $this->faker->randomElement(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
            'freshness' => $this->faker->randomElement(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
            'damaged_quantity' => $this->faker->randomFloat(2, 0, 5),
            'accepted_quantity' => $this->faker->randomFloat(2, 80, 100),
            'rejected_quantity' => $this->faker->randomFloat(2, 0, 10),
            'grade' => $this->faker->randomElement(['A', 'B', 'C']),
            'status' => 'PENDING',
            'notes' => $this->faker->sentence(),
        ];
    }
}