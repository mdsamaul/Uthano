<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleAndPermissionSeeder::class);

        // Create admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@uthano.com'],
            [
                'name' => 'UTHANO Admin',
                'password' => Hash::make('password'),
                'phone' => '01700000000',
                'is_active' => true,
            ]
        );
        $admin->assignRole('admin');

        // Create demo customer
        $customer = User::updateOrCreate(
            ['email' => 'customer@uthano.com'],
            [
                'name' => 'Demo Customer',
                'password' => Hash::make('password'),
                'phone' => '01700000001',
                'is_active' => true,
            ]
        );
        $customer->assignRole('customer');

        // Create customer profile
        \App\Models\CustomerProfile::updateOrCreate(
            ['user_id' => $customer->id],
            [
                'customer_code' => 'CUS-DEMO-001',
                'full_name' => 'Demo Customer',
                'phone' => '01700000001',
            ]
        );

        // Create demo farmer
        $farmerUser = User::updateOrCreate(
            ['email' => 'farmer@uthano.com'],
            [
                'name' => 'Rahim Ahmed',
                'password' => Hash::make('password'),
                'phone' => '01700000002',
                'is_active' => true,
            ]
        );
        $farmerUser->assignRole('farmer');

        $farmer = \App\Models\Farmer::updateOrCreate(
            ['farmer_code' => 'FRM-DEMO-001'],
            [
                'user_id' => $farmerUser->id,
                'full_name' => 'Rahim Ahmed',
                'phone' => '01700000002',
                'status' => 'ACTIVE',
                'verification_status' => 'VERIFIED',
            ]
        );

        // Create demo farm
        $farm = \App\Models\Farm::updateOrCreate(
            ['farm_code' => 'FARM-DEMO-001'],
            [
                'farmer_id' => $farmer->id,
                'farm_name' => 'Rahim Agro Farm',
                'division' => 'Khulna',
                'district' => 'Jhenaidah',
                'upazila' => 'Kaliganj',
                'village' => 'Barobazar',
                'address' => 'Village Barobazar, Kaliganj, Jhenaidah',
                'status' => 'ACTIVE',
                'verification_status' => 'VERIFIED',
            ]
        );

        // Create units
        $kg = \App\Models\Unit::updateOrCreate(['symbol' => 'kg'], ['name' => 'Kilogram', 'symbol' => 'kg']);
        $piece = \App\Models\Unit::updateOrCreate(['symbol' => 'pc'], ['name' => 'Piece', 'symbol' => 'pc']);
        $dozen = \App\Models\Unit::updateOrCreate(['symbol' => 'dz'], ['name' => 'Dozen', 'symbol' => 'dz']);

        // Create categories
        $fruits = \App\Models\Category::updateOrCreate(['slug' => 'fruits'], ['name' => 'Fruits', 'slug' => 'fruits']);
        $vegetables = \App\Models\Category::updateOrCreate(['slug' => 'vegetables'], ['name' => 'Vegetables', 'slug' => 'vegetables']);
        $organic = \App\Models\Category::updateOrCreate(['slug' => 'organic'], ['name' => 'Organic', 'slug' => 'organic']);

        // Create demo products
        $mango = \App\Models\Product::updateOrCreate(
            ['sku' => 'UTH-MANGO-001'],
            [
                'category_id' => $fruits->id,
                'unit_id' => $kg->id,
                'name' => 'Fresh Mango',
                'slug' => 'fresh-mango',
                'description' => 'Fresh mango from Jhenaidah farms',
                'short_description' => 'Sweet and juicy mango',
                'product_type' => 'FRESH',
                'base_price' => 80,
                'selling_price' => 100,
                'cost_price' => 60,
                'minimum_order_quantity' => 1,
                'stock_tracking' => true,
                'is_featured' => true,
                'is_active' => true,
                'status' => 'ACTIVE',
            ]
        );

        $guava = \App\Models\Product::updateOrCreate(
            ['sku' => 'UTH-GUAVA-001'],
            [
                'category_id' => $fruits->id,
                'unit_id' => $kg->id,
                'name' => 'Fresh Guava',
                'slug' => 'fresh-guava',
                'description' => 'Fresh guava from Jhenaidah farms',
                'short_description' => 'Crisp and fresh guava',
                'product_type' => 'FRESH',
                'base_price' => 60,
                'selling_price' => 75,
                'cost_price' => 40,
                'minimum_order_quantity' => 1,
                'stock_tracking' => true,
                'is_featured' => true,
                'is_active' => true,
                'status' => 'ACTIVE',
            ]
        );

        // Create demo warehouse
        $warehouse = \App\Models\Warehouse::updateOrCreate(
            ['warehouse_code' => 'WH-JH-001'],
            [
                'name' => 'Jhenaidah Collection Center',
                'type' => 'COLLECTION_CENTER',
                'address' => 'Kaliganj, Jhenaidah',
                'district' => 'Jhenaidah',
                'area' => 'Kaliganj',
                'status' => 'ACTIVE',
            ]
        );

        // Create demo harvest
        $harvest = \App\Models\Harvest::updateOrCreate(
            ['harvest_code' => 'HARV-2026-0001'],
            [
                'farm_id' => $farm->id,
                'product_id' => $guava->id,
                'harvest_date' => now()->subDays(2),
                'estimated_quantity' => 500,
                'actual_quantity' => 500,
                'quantity_unit_id' => $kg->id,
                'quality_grade' => 'A',
                'status' => 'BATCHED',
            ]
        );

        // Create demo harvest batch
        $batch = \App\Models\HarvestBatch::updateOrCreate(
            ['batch_code' => 'BATCH-JH-GUA-20260810-0001'],
            [
                'harvest_id' => $harvest->id,
                'product_id' => $guava->id,
                'quantity' => 500,
                'remaining_quantity' => 500,
                'unit_id' => $kg->id,
                'quality_grade' => 'A',
                'harvested_at' => now()->subDays(2),
                'status' => 'AVAILABLE',
            ]
        );

        // Create demo inventory
        \App\Models\InventoryItem::updateOrCreate(
            [
                'product_id' => $guava->id,
                'harvest_batch_id' => $batch->id,
                'warehouse_id' => $warehouse->id,
            ],
            [
                'quantity' => 500,
                'reserved_quantity' => 0,
                'available_quantity' => 500,
                'unit_id' => $kg->id,
                'status' => 'ACTIVE',
            ]
        );

        // Create demo sourcing record
        \App\Models\SourcingRecord::updateOrCreate(
            ['sourcing_code' => 'SRC-DEMO-001'],
            [
                'farmer_id' => $farmer->id,
                'farm_id' => $farm->id,
                'harvest_batch_id' => $batch->id,
                'product_id' => $guava->id,
                'quantity' => 500,
                'unit_id' => $kg->id,
                'purchase_price' => 40,
                'total_cost' => 20000,
                'transport_cost' => 1000,
                'packaging_cost' => 500,
                'other_cost' => 0,
                'total_procurement_cost' => 21500,
                'sourced_at' => now()->subDays(1),
                'received_at' => now()->subDays(1),
                'warehouse_id' => $warehouse->id,
                'status' => 'RECEIVED',
            ]
        );

        // Create demo delivery zone
        \App\Models\DeliveryZone::updateOrCreate(
            ['name' => 'Jhenaidah Sadar', 'district' => 'Jhenaidah'],
            [
                'name' => 'Jhenaidah Sadar',
                'district' => 'Jhenaidah',
                'area' => 'Sadar',
                'base_charge' => 50,
                'weight_based_charge' => 10,
                'status' => 'ACTIVE',
            ]
        );
    }
}