<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->lexify('??????')),
            'type' => $this->faker->randomElement(['PERCENTAGE', 'FIXED']),
            'value' => $this->faker->randomFloat(2, 5, 100),
            'minimum_order_amount' => $this->faker->randomFloat(2, 100, 500),
            'maximum_discount' => $this->faker->randomFloat(2, 50, 200),
            'start_at' => now()->subDay(),
            'end_at' => now()->addDays(30),
            'usage_limit' => $this->faker->numberBetween(10, 100),
            'per_customer_limit' => 1,
            'is_active' => true,
        ];
    }
}