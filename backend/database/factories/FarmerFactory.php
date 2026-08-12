<?php

namespace Database\Factories;

use App\Models\Farmer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Farmer>
 */
class FarmerFactory extends Factory
{
    protected $model = Farmer::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'farmer_code' => 'FRM-' . strtoupper(fake()->unique()->bothify('####')),
            'full_name' => fake()->name(),
            'phone' => fake()->unique()->numerify('01#########'),
            'alternate_phone' => null,
            'national_id' => null,
            'photo' => null,
            'status' => 'ACTIVE',
            'verification_status' => 'PENDING',
            'notes' => null,
        ];
    }
}