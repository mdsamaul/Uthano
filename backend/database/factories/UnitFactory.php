<?php

namespace Database\Factories;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    protected $model = Unit::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Kilogram', 'Gram', 'Piece', 'Dozen', 'Liter', 'Box']),
            'symbol' => fake()->unique()->randomElement(['kg', 'g', 'pc', 'dz', 'L', 'box']),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}