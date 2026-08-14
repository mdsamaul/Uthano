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
            ['name' => 'Super Admin', 'slug' => 'superadmin', 'description' => 'Unrestricted access. Can manage users, roles and grant page-level access to everyone.'],
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Full system access (granted via permissions)'],
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

            // Category
            ['name' => 'View Categories', 'slug' => 'category.view', 'group' => 'category'],
            ['name' => 'Create Categories', 'slug' => 'category.create', 'group' => 'category'],
            ['name' => 'Update Categories', 'slug' => 'category.update', 'group' => 'category'],
            ['name' => 'Delete Categories', 'slug' => 'category.delete', 'group' => 'category'],

            // Customer
            ['name' => 'View Customers', 'slug' => 'customer.view', 'group' => 'customer'],

            // Order
            ['name' => 'View Orders', 'slug' => 'order.view', 'group' => 'order'],
            ['name' => 'Update Orders', 'slug' => 'order.update', 'group' => 'order'],
            ['name' => 'Update Order Status', 'slug' => 'order.status.update', 'group' => 'order'],
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

            // Harvest
            ['name' => 'View Harvests', 'slug' => 'harvest.view', 'group' => 'harvest'],
            ['name' => 'Manage Harvests', 'slug' => 'harvest.manage', 'group' => 'harvest'],

            // Batch
            ['name' => 'View Batches', 'slug' => 'batch.view', 'group' => 'batch'],
            ['name' => 'Manage Batches', 'slug' => 'batch.manage', 'group' => 'batch'],

            // Inventory
            ['name' => 'View Inventory', 'slug' => 'inventory.view', 'group' => 'inventory'],
            ['name' => 'Adjust Inventory', 'slug' => 'inventory.adjust', 'group' => 'inventory'],

            // Warehouse
            ['name' => 'View Warehouses', 'slug' => 'warehouse.view', 'group' => 'warehouse'],
            ['name' => 'Manage Warehouses', 'slug' => 'warehouse.manage', 'group' => 'warehouse'],

            // Delivery
            ['name' => 'View Deliveries', 'slug' => 'delivery.view', 'group' => 'delivery'],
            ['name' => 'Assign Deliveries', 'slug' => 'delivery.assign', 'group' => 'delivery'],
            ['name' => 'Update Deliveries', 'slug' => 'delivery.update', 'group' => 'delivery'],

            // Sourcing
            ['name' => 'View Sourcing', 'slug' => 'sourcing.view', 'group' => 'sourcing'],
            ['name' => 'Manage Sourcing', 'slug' => 'sourcing.manage', 'group' => 'sourcing'],

            // Quality Check
            ['name' => 'View Quality Checks', 'slug' => 'quality-check.view', 'group' => 'quality-check'],
            ['name' => 'Manage Quality Checks', 'slug' => 'quality-check.manage', 'group' => 'quality-check'],

            // Coupon
            ['name' => 'View Coupons', 'slug' => 'coupon.view', 'group' => 'coupon'],
            ['name' => 'Manage Coupons', 'slug' => 'coupon.manage', 'group' => 'coupon'],

            // Packaging
            ['name' => 'View Packaging', 'slug' => 'packaging.view', 'group' => 'packaging'],
            ['name' => 'Manage Packaging', 'slug' => 'packaging.manage', 'group' => 'packaging'],

            // Product Review
            ['name' => 'View Reviews', 'slug' => 'review.view', 'group' => 'review'],
            ['name' => 'Manage Reviews', 'slug' => 'review.manage', 'group' => 'review'],

            // Audit
            ['name' => 'View Audit Logs', 'slug' => 'audit.view', 'group' => 'audit'],

            // Reports
            ['name' => 'View Reports', 'slug' => 'report.view', 'group' => 'report'],
            ['name' => 'Export Reports', 'slug' => 'report.export', 'group' => 'report'],

            // Settings
            ['name' => 'View Settings', 'slug' => 'settings.view', 'group' => 'settings'],
            ['name' => 'Update Settings', 'slug' => 'settings.update', 'group' => 'settings'],

            // Dashboard
            ['name' => 'View Dashboard', 'slug' => 'dashboard.view', 'group' => 'dashboard'],

            // User & role management (superadmin)
            ['name' => 'View Users', 'slug' => 'user.view', 'group' => 'permission'],
            ['name' => 'Manage Users', 'slug' => 'user.manage', 'group' => 'permission'],
            ['name' => 'View Roles', 'slug' => 'role.view', 'group' => 'permission'],
            ['name' => 'Manage Roles', 'slug' => 'role.manage', 'group' => 'permission'],
            ['name' => 'View Permissions', 'slug' => 'permission.view', 'group' => 'permission'],
            ['name' => 'Manage Permissions', 'slug' => 'permission.manage', 'group' => 'permission'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['slug' => $permission['slug']], $permission);
        }

        // ============================================
        // ASSIGN PERMISSIONS TO ROLES
        // ============================================

        $superAdmin = Role::where('slug', 'superadmin')->first();
        $admin = Role::where('slug', 'admin')->first();
        $staff = Role::where('slug', 'staff')->first();
        $warehouseManager = Role::where('slug', 'warehouse_manager')->first();
        $deliveryAgent = Role::where('slug', 'delivery_agent')->first();

        // Super Admin gets all permissions (full bypass)
        $superAdmin->permissions()->sync(Permission::pluck('id'));

        // Admin role is permission-based: it only grants dashboard access by default.
        // Individual admins receive their real permissions via direct assignment
        // or through specialized roles (managed by the superadmin).
        $admin->permissions()->sync(
            Permission::where('slug', 'dashboard.view')->pluck('id')
        );

        // Staff gets operational permissions
        $staff->permissions()->sync(
            Permission::whereIn('slug', [
                'product.view', 'product.create', 'product.update',
                'category.view', 'category.create', 'category.update',
                'customer.view',
                'order.view', 'order.update', 'order.cancel',
                'farmer.view', 'farmer.create', 'farmer.update',
                'farm.view', 'farm.create', 'farm.update',
                'harvest.view', 'harvest.manage',
                'batch.view',
                'inventory.view', 'inventory.adjust',
                'warehouse.view',
                'delivery.view', 'delivery.assign', 'delivery.update',
                'sourcing.view', 'sourcing.manage',
                'quality-check.view',
                'coupon.view',
                'review.view',
                'dashboard.view',
            ])->pluck('id')
        );

        // Warehouse manager gets inventory/warehouse permissions
        $warehouseManager->permissions()->sync(
            Permission::whereIn('slug', [
                'inventory.view', 'inventory.adjust',
                'warehouse.view', 'warehouse.manage',
                'harvest.view',
                'batch.view',
                'sourcing.view',
                'delivery.view',
                'quality-check.view',
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