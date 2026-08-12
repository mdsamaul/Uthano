<?php

namespace Database\Factories;

use App\Models\CustomerAddress;
use App\Models\CustomerProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerAddress>
 */
class CustomerAddressFactory extends Factory
{
    protected $model = CustomerAddress::class;

    public function definition(): array
    {
        return [
            'customer_profile_id' => CustomerProfile::factory(),
            'name' => fake()->name(),
            'phone' => fake()->numerify('01#########'),
            'division' => 'Dhaka',
            'district' => fake()->randomElement(['Dhaka', 'Jhenaidah', 'Khulna', 'Chattogram']),
            'upazila' => fake()->citySuffix(),
            'area' => fake()->streetName(),
            'address_line' => fake()->streetAddress(),
            'postal_code' => fake()->numerify('####'),
            'latitude' => fake()->latitude(23.5, 24.0),
            'longitude' => fake()->longitude(89.5, 90.5),
            'address_type' => 'HOME',
            'is_default' => false,
        ];
    }
}