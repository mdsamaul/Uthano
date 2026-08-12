<?php

namespace Database\Factories;

use App\Models\Farm;
use App\Models\Farmer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Farm>
 */
class FarmFactory extends Factory
{
    protected $model = Farm::class;

    public function definition(): array
    {
        return [
            'farmer_id' => Farmer::factory(),
            'farm_code' => 'FARM-' . strtoupper(fake()->unique()->bothify('####')),
            'farm_name' => fake()->lastName() . ' Agro Farm',
            'division' => 'Khulna',
            'district' => 'Jhenaidah',
            'upazila' => fake()->randomElement(['Kaliganj', 'Jhenaidah Sadar', 'Shailkupa', 'Harinakunda']),
            'village' => fake()->citySuffix(),
            'address' => fake()->streetAddress(),
            'latitude' => fake()->latitude(23.5, 23.8),
            'longitude' => fake()->longitude(89.0, 89.3),
            'land_area' => fake()->randomFloat(2, 1, 20),
            'land_area_unit' => 'bigha',
            'soil_type' => fake()->randomElement(['Loamy', 'Sandy', 'Clay', 'Alluvial']),
            'irrigation_type' => fake()->randomElement(['Drip', 'Sprinkler', 'Flood', 'Rain-fed']),
            'farming_method' => fake()->randomElement(['Organic', 'Conventional', 'Integrated']),
            'status' => 'ACTIVE',
            'verification_status' => 'PENDING',
            'notes' => null,
        ];
    }
}