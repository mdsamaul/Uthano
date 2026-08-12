<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ============================================
        // ROLES
        // ============================================

        $roles = [
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Full system access'],
            ['name' => 'Customer', 'slug' => 'customer', 'description' => 'E-commerce customer'],
            ['name' => 'Farmer', 'slug' => 'farmer', 'description' => 'Farmer who supplies products'],
            ['name' => 'Warehouse Manager', 'slug' => 'warehouse_manager', 'description' => 'Manages warehouse and inventory'],
            ['name' => 'Delivery Agent', 'slug' => 'delivery_agent', 'description' => 'Delivers orders to customers'],
            ['name' => 'Staff', 'slug' => 'staff', 'description' => 'UTHANO staff member'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['slug' => $role['slug']], $role);
        }

        // ============================================
        // PERMISSIONS
        // ============================================

        $permissions = [
            // Product
            ['name' => 'View Products', 'slug' => 'product.view', 'group' => 'product'],
            ['name' => 'Create Products', 'slug' => 'product.create', 'group' => 'product'],
            ['name' => 'Update Products', 'slug' => 'product.update', 'group' => 'product'],
            ['name' => 'Delete Products', 'slug' => 'product.delete', 'group' => 'product'],

            // Order
            ['name' => 'View Orders', 'slug' => 'order.view', 'group' => 'order'],
            ['name' => 'Update Orders', 'slug' => 'order.update', 'group' => 'order'],
            ['name' => 'Cancel Orders', 'slug' => 'order.cancel', 'group' => 'order'],

            // Farmer
            ['name' => 'View Farmers', 'slug' => 'farmer.view', 'group' => 'farmer'],
            ['name' => 'Create Farmers', 'slug' => 'farmer.create', 'group' => 'farmer'],
            ['name' => 'Update Farmers', 'slug' => 'farmer.update', 'group' => 'farmer'],
            ['name' => 'Delete Farmers', 'slug' => 'farmer.delete', 'group' => 'farmer'],

            // Farm
            ['name' => 'View Farms', 'slug' => 'farm.view', 'group' => 'farm'],
            ['name' => 'Create Farms', 'slug' => 'farm.create', 'group' => 'farm'],
            ['name' => 'Update Farms', 'slug' => 'farm.update', 'group' => 'farm'],
            ['name' => 'Delete Farms', 'slug' => 'farm.delete', 'group' => 'farm'],

            // Inventory
            ['name' => 'View Inventory', 'slug' => 'inventory.view', 'group' => 'inventory'],
            ['name' => 'Adjust Inventory', 'slug' => 'inventory.adjust', 'group' => 'inventory'],

            // Delivery
            ['name' => 'View Deliveries', 'slug' => 'delivery.view', 'group' => 'delivery'],
            ['name' => 'Assign Deliveries', 'slug' => 'delivery.assign', 'group' => 'delivery'],
            ['name' => 'Update Deliveries', 'slug' => 'delivery.update', 'group' => 'delivery'],

            // Warehouse
            ['name' => 'View Warehouses', 'slug' => 'warehouse.view', 'group' => 'warehouse'],
            ['name' => 'Manage Warehouses', 'slug' => 'warehouse.manage', 'group' => 'warehouse'],

            // Harvest
            ['name' => 'View Harvests', 'slug' => 'harvest.view', 'group' => 'harvest'],
            ['name' => 'Manage Harvests', 'slug' => 'harvest.manage', 'group' => 'harvest'],

            // Sourcing
            ['name' => 'View Sourcing', 'slug' => 'sourcing.view', 'group' => 'sourcing'],
            ['name' => 'Manage Sourcing', 'slug' => 'sourcing.manage', 'group' => 'sourcing'],

            // Dashboard
            ['name' => 'View Dashboard', 'slug' => 'dashboard.view', 'group' => 'dashboard'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['slug' => $permission['slug']], $permission);
        }

        // ============================================
        // ASSIGN PERMISSIONS TO ROLES
        // ============================================

        $admin = Role::where('slug', 'admin')->first();
        $staff = Role::where('slug', 'staff')->first();
        $warehouseManager = Role::where('slug', 'warehouse_manager')->first();
        $deliveryAgent = Role::where('slug', 'delivery_agent')->first();

        // Admin gets all permissions
        $admin->permissions()->sync(Permission::pluck('id'));

        // Staff gets operational permissions
        $staff->permissions()->sync(
            Permission::whereIn('slug', [
                'product.view', 'product.create', 'product.update',
                'order.view', 'order.update', 'order.cancel',
                'farmer.view', 'farmer.create', 'farmer.update',
                'farm.view', 'farm.create', 'farm.update',
                'inventory.view',
                'delivery.view', 'delivery.assign', 'delivery.update',
                'warehouse.view',
                'harvest.view', 'harvest.manage',
                'sourcing.view', 'sourcing.manage',
                'dashboard.view',
            ])->pluck('id')
        );

        // Warehouse manager gets inventory/warehouse permissions
        $warehouseManager->permissions()->sync(
            Permission::whereIn('slug', [
                'inventory.view', 'inventory.adjust',
                'warehouse.view', 'warehouse.manage',
                'harvest.view',
                'sourcing.view',
                'delivery.view',
                'product.view',
                'order.view',
                'dashboard.view',
            ])->pluck('id')
        );

        // Delivery agent gets delivery permissions
        $deliveryAgent->permissions()->sync(
            Permission::whereIn('slug', [
                'delivery.view', 'delivery.update',
            ])->pluck('id')
        );
    }
}