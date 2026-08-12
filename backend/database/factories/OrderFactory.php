<?php

namespace Database\Factories;

use App\Models\CustomerAddress;
use App\Models\CustomerProfile;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 100, 5000);

        return [
            'order_number' => 'UTH-' . strtoupper(fake()->unique()->bothify('#####')),
            'customer_id' => CustomerProfile::factory(),
            'address_id' => CustomerAddress::factory(),
            'subtotal' => $subtotal,
            'discount' => 0,
            'delivery_charge' => fake()->randomFloat(2, 30, 100),
            'tax' => null,
            'total' => $subtotal + 50,
            'currency' => 'BDT',
            'payment_method' => 'COD',
            'payment_status' => 'PENDING',
            'order_status' => 'PENDING',
            'notes' => null,
            'placed_at' => now(),
        ];
    }
}