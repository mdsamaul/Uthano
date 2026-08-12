<?php

namespace Database\Factories;

use App\Models\CustomerProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerProfile>
 */
class CustomerProfileFactory extends Factory
{
    protected $model = CustomerProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'customer_code' => 'CUS-' . strtoupper(fake()->unique()->bothify('####')),
            'full_name' => fake()->name(),
            'phone' => fake()->unique()->numerify('01#########'),
            'alternate_phone' => null,
            'photo' => null,
            'status' => 'ACTIVE',
            'notes' => null,
        ];
    }
}