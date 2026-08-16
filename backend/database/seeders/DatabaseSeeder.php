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
        // Seed roles & permissions first (used by admin/user management features)
        $this->call(RoleAndPermissionSeeder::class);

        // ============================================
        // SUPER ADMIN
        // ============================================
        User::updateOrCreate(
            ['email' => 'superadmin@uthano.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'phone' => '01700000999',
                'is_active' => true,
                'role' => 'superadmin',
            ]
        );

        // ============================================
        // ADMIN USERS
        // ============================================

        // Create main admin user (full operational access via direct permissions,
        // excluding superadmin-only user/role/permission management)
        $mainAdmin = User::updateOrCreate(
            ['email' => 'admin@uthano.com'],
            [
                'name' => 'UTHANO Admin',
                'password' => Hash::make('password'),
                'phone' => '01700000000',
                'is_active' => true,
                'role' => 'admin',
            ]
        );
        $mainAdmin->permissions()->sync(
            \App\Models\Permission::whereNotIn('slug', [
                'user.view', 'user.manage',
                'role.view', 'role.manage',
                'permission.view', 'permission.manage',
            ])->pluck('id')
        );

        // Admin A - Product Manager (only product + category access)
        $adminA = User::updateOrCreate(
            ['email' => 'admin-a@uthano.com'],
            [
                'name' => 'Admin A - Product Manager',
                'password' => Hash::make('password'),
                'phone' => '01700000101',
                'is_active' => true,
                'role' => 'admin',
            ]
        );
        $adminA->permissions()->sync(
            \App\Models\Permission::whereIn('slug', [
                'dashboard.view',
                'product.view', 'product.create', 'product.update', 'product.delete',
                'category.view',
            ])->pluck('id')
        );

        // Admin B - Order Manager (order + customer access)
        $adminB = User::updateOrCreate(
            ['email' => 'admin-b@uthano.com'],
            [
                'name' => 'Admin B - Order Manager',
                'password' => Hash::make('password'),
                'phone' => '01700000102',
                'is_active' => true,
                'role' => 'admin',
            ]
        );
        $adminB->permissions()->sync(
            \App\Models\Permission::whereIn('slug', [
                'dashboard.view',
                'order.view', 'order.update', 'order.status.update', 'order.cancel',
                'customer.view',
            ])->pluck('id')
        );

        // Admin C - Delivery Manager (delivery access)
        $adminC = User::updateOrCreate(
            ['email' => 'admin-c@uthano.com'],
            [
                'name' => 'Admin C - Delivery Manager',
                'password' => Hash::make('password'),
                'phone' => '01700000103',
                'is_active' => true,
                'role' => 'admin',
            ]
        );
        $adminC->permissions()->sync(
            \App\Models\Permission::whereIn('slug', [
                'dashboard.view',
                'delivery.view', 'delivery.assign', 'delivery.update',
            ])->pluck('id')
        );

        // Staff user
        User::updateOrCreate(
            ['email' => 'staff@uthano.com'],
            [
                'name' => 'UTHANO Staff',
                'password' => Hash::make('password'),
                'phone' => '01700000004',
                'is_active' => true,
                'role' => 'staff',
            ]
        );

        // Warehouse manager
        User::updateOrCreate(
            ['email' => 'warehouse@uthano.com'],
            [
                'name' => 'Warehouse Manager',
                'password' => Hash::make('password'),
                'phone' => '01700000005',
                'is_active' => true,
                'role' => 'warehouse_manager',
            ]
        );

        // ============================================
        // CUSTOMER
        // ============================================

        $customer = User::updateOrCreate(
            ['email' => 'customer@uthano.com'],
            [
                'name' => 'Demo Customer',
                'password' => Hash::make('password'),
                'phone' => '01700000001',
                'is_active' => true,
                'role' => 'customer',
            ]
        );

        // Create customer profile
        \App\Models\CustomerProfile::updateOrCreate(
            ['user_id' => $customer->id],
            [
                'customer_code' => 'CUS-DEMO-001',
                'full_name' => 'Demo Customer',
                'phone' => '01700000001',
            ]
        );

        // ============================================
        // FARMER
        // ============================================

        $farmerUser = User::updateOrCreate(
            ['email' => 'farmer@uthano.com'],
            [
                'name' => 'Rahim Ahmed',
                'password' => Hash::make('password'),
                'phone' => '01700000002',
                'is_active' => true,
                'role' => 'farmer',
            ]
        );

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

        // ============================================
        // DELIVERY AGENT
        // ============================================
        $deliveryAgentUser = User::updateOrCreate(
            ['email' => 'agent@uthano.com'],
            [
                'name' => 'Delivery Agent',
                'password' => Hash::make('password'),
                'phone' => '01700000010',
                'is_active' => true,
                'role' => 'delivery_agent',
            ]
        );

                $deliveryAgent = \App\Models\DeliveryAgent::updateOrCreate(
            ['user_id' => $deliveryAgentUser->id],
            [
                'agent_code' => 'DEL-AGENT-001',
                'phone' => '01700000010',
                'vehicle_type' => 'Motorcycle',
                'vehicle_number' => 'DH-1234',
                'status' => 'ACTIVE',
            ]
        );

        // ============================================
        // ORDERS & DELIVERIES (demo data)
        // ============================================
        $customerProfile = \App\Models\CustomerProfile::where('customer_code', 'CUS-DEMO-001')->first();
        $deliveryZone = \App\Models\DeliveryZone::where('name', 'Jhenaidah Sadar')->first();
        $warehouse = \App\Models\Warehouse::where('warehouse_code', 'WH-JH-001')->first();

        if ($customerProfile) {
            // Create delivery address for the customer
            $address = \App\Models\CustomerAddress::updateOrCreate(
                ['customer_profile_id' => $customerProfile->id, 'phone' => '01700000001'],
                [
                    'name' => 'Demo Customer',
                    'phone' => '01700000001',
                    'division' => 'Khulna',
                    'district' => 'Jhenaidah',
                    'upazila' => 'Kaliganj',
                    'area' => 'Sadar',
                    'address_line' => '123 Main Road, Kaliganj, Jhenaidah',
                    'postal_code' => '75100',
                    'address_type' => 'HOME',
                    'is_default' => true,
                ]
            );

            // Order 1 — Delivered
            $order1 = \App\Models\Order::updateOrCreate(
                ['order_number' => 'UTH-DEMO-001'],
                [
                    'customer_id' => $customerProfile->id,
                    'address_id' => $address->id,
                    'subtotal' => 150,
                    'discount' => 0,
                    'delivery_charge' => 50,
                    'tax' => 0,
                    'total' => 200,
                    'currency' => 'BDT',
                    'payment_method' => 'COD',
                    'payment_status' => 'PENDING',
                    'order_status' => 'DELIVERED',
                    'notes' => null,
                    'placed_at' => now()->subDays(2),
                    'confirmed_at' => now()->subDays(2),
                    'delivered_at' => now()->subDays(1),
                ]
            );

            \App\Models\OrderItem::updateOrCreate(
                ['order_id' => $order1->id, 'product_id' => $guava->id],
                [
                    'product_name' => 'Fresh Guava',
                    'sku' => 'UTH-GUAVA-001',
                    'quantity' => 2,
                    'unit_id' => $kg->id,
                    'unit_price' => 75,
                    'discount' => 0,
                    'total' => 150,
                ]
            );

            \App\Models\Delivery::updateOrCreate(
                ['order_id' => $order1->id],
                [
                    'delivery_code' => 'DEL-' . strtoupper(uniqid()),
                    'delivery_agent_id' => $deliveryAgent->id,
                    'delivery_zone_id' => $deliveryZone?->id,
                    'pickup_warehouse_id' => $warehouse?->id,
                    'assigned_at' => now()->subDays(2),
                    'picked_up_at' => now()->subDays(2),
                    'out_for_delivery_at' => now()->subDays(2),
                    'delivered_at' => now()->subDays(1),
                    'status' => 'DELIVERED',
                    'delivery_fee' => 50,
                    'customer_note' => null,
                    'proof_of_delivery' => null,
                ]
            );

            // Order 2 — Pending (not yet assigned)
            $order2 = \App\Models\Order::updateOrCreate(
                ['order_number' => 'UTH-DEMO-002'],
                [
                    'customer_id' => $customerProfile->id,
                    'address_id' => $address->id,
                    'subtotal' => 300,
                    'discount' => 0,
                    'delivery_charge' => 50,
                    'tax' => 0,
                    'total' => 350,
                    'currency' => 'BDT',
                    'payment_method' => 'COD',
                    'payment_status' => 'PENDING',
                    'order_status' => 'PENDING',
                    'notes' => null,
                    'placed_at' => now()->subHours(2),
                    'confirmed_at' => now()->subHours(2),
                ]
            );

            \App\Models\OrderItem::updateOrCreate(
                ['order_id' => $order2->id, 'product_id' => $mango->id],
                [
                    'product_name' => 'Fresh Mango',
                    'sku' => 'UTH-MANGO-001',
                    'quantity' => 3,
                    'unit_id' => $kg->id,
                    'unit_price' => 100,
                    'discount' => 0,
                    'total' => 300,
                ]
            );

            \App\Models\Delivery::updateOrCreate(
                ['order_id' => $order2->id],
                [
                    'delivery_code' => 'DEL-' . strtoupper(uniqid()),
                    'delivery_agent_id' => null,
                    'delivery_zone_id' => $deliveryZone?->id,
                    'pickup_warehouse_id' => $warehouse?->id,
                    'assigned_at' => null,
                    'picked_up_at' => null,
                    'out_for_delivery_at' => null,
                    'delivered_at' => null,
                    'status' => 'PENDING',
                    'delivery_fee' => 50,
                    'customer_note' => null,
                    'proof_of_delivery' => null,
                ]
            );

            // Order 3 — Out for delivery
            $order3 = \App\Models\Order::updateOrCreate(
                ['order_number' => 'UTH-DEMO-003'],
                [
                    'customer_id' => $customerProfile->id,
                    'address_id' => $address->id,
                    'subtotal' => 75,
                    'discount' => 0,
                    'delivery_charge' => 50,
                    'tax' => 0,
                    'total' => 125,
                    'currency' => 'BDT',
                    'payment_method' => 'COD',
                    'payment_status' => 'PENDING',
                    'order_status' => 'OUT_FOR_DELIVERY',
                    'notes' => null,
                    'placed_at' => now()->subHours(5),
                    'confirmed_at' => now()->subHours(5),
                ]
            );

            \App\Models\OrderItem::updateOrCreate(
                ['order_id' => $order3->id, 'product_id' => $guava->id],
                [
                    'product_name' => 'Fresh Guava',
                    'sku' => 'UTH-GUAVA-001',
                    'quantity' => 1,
                    'unit_id' => $kg->id,
                    'unit_price' => 75,
                    'discount' => 0,
                    'total' => 75,
                ]
            );

            \App\Models\Delivery::updateOrCreate(
                ['order_id' => $order3->id],
                [
                    'delivery_code' => 'DEL-' . strtoupper(uniqid()),
                    'delivery_agent_id' => $deliveryAgent->id,
                    'delivery_zone_id' => $deliveryZone?->id,
                    'pickup_warehouse_id' => $warehouse?->id,
                    'assigned_at' => now()->subHours(3),
                    'picked_up_at' => now()->subHours(2),
                    'out_for_delivery_at' => now()->subHours(1),
                    'delivered_at' => null,
                    'status' => 'OUT_FOR_DELIVERY',
                    'delivery_fee' => 50,
                    'customer_note' => null,
                    'proof_of_delivery' => null,
                ]
            );
        }
    }
}