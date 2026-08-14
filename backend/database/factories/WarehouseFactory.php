<?php

namespace Database\Factories;

use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Warehouse>
 */
class WarehouseFactory extends Factory
{
    protected $model = Warehouse::class;

    public function definition(): array
    {
        return [
            'warehouse_code' => 'WH-' . strtoupper($this->faker->unique()->lexify('???')),
            'name' => $this->faker->company(),
            'type' => $this->faker->randomElement(['COLLECTION_CENTER', 'WAREHOUSE', 'DHAKA_HUB', 'DISTRIBUTION_CENTER']),
            'address' => $this->faker->streetAddress(),
            'district' => $this->faker->city(),
            'area' => $this->faker->citySuffix() . ' Zone',
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'status' => 'ACTIVE',
        ];
    }
}