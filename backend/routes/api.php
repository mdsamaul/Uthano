<?php

use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\AccessController;
use App\Http\Controllers\Api\V1\Admin\DeliveryAgentController;
use App\Http\Controllers\Api\V1\Admin\DeliveryController;
use App\Http\Controllers\Api\V1\Admin\DeliveryZoneController;
use App\Http\Controllers\Api\V1\Admin\FarmController;
use App\Http\Controllers\Api\V1\Admin\FarmerController;
use App\Http\Controllers\Api\V1\Admin\HarvestController;
use App\Http\Controllers\Api\V1\Admin\InventoryController;
use App\Http\Controllers\Api\V1\Admin\QualityCheckController;
use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\BatchController;
use App\Http\Controllers\Api\V1\Admin\CouponController;
use App\Http\Controllers\Api\V1\Admin\PackagingItemController;
use App\Http\Controllers\Api\V1\Admin\PackagingTypeController;
use App\Http\Controllers\Api\V1\Admin\ProductReviewController;
use App\Http\Controllers\Api\V1\Admin\SourcingController;
use App\Http\Controllers\Api\V1\Admin\UserAdminController;
use App\Http\Controllers\Api\V1\Admin\UnitController;
use App\Http\Controllers\Api\V1\Admin\RoleAdminController;
use App\Http\Controllers\Api\V1\Admin\WarehouseController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\FarmerPortalController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| UTHANO REST API - Version 1
| "From Farm to Family"
|
*/

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'UTHANO API',
        'version' => 'v1',
    ]);
});

Route::prefix('v1')->group(function () {

    // ============================================
    // PUBLIC ROUTES
    // ============================================

    // Auth
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login'])->name('login');

    // OTP authentication (customers)
    Route::post('auth/otp/request', [AuthController::class, 'requestOtp'])->middleware('throttle:5,1');
    Route::post('auth/otp/verify', [AuthController::class, 'verifyOtp'])->middleware('throttle:10,1');

    // Categories (public catalog)
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{slug}', [CategoryController::class, 'show']);

    // Products (public catalog)
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{id}', [ProductController::class, 'show']);

    // ============================================
    // AUTHENTICATED ROUTES
    // ============================================

    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::get('notifications/{id}', [NotificationController::class, 'show']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);
        Route::delete('notifications', [NotificationController::class, 'destroyAll']);

        // Customer profile
        Route::get('customer/profile', [CustomerController::class, 'profile']);
        Route::put('customer/profile', [CustomerController::class, 'updateProfile']);

        // Customer addresses
        Route::get('customer/addresses', [CustomerController::class, 'addresses']);
        Route::post('customer/addresses', [CustomerController::class, 'storeAddress']);
        Route::put('customer/addresses/{id}', [CustomerController::class, 'updateAddress']);
        Route::delete('customer/addresses/{id}', [CustomerController::class, 'destroyAddress']);

        // Cart
        Route::get('cart', [CartController::class, 'index']);
        Route::post('cart/items', [CartController::class, 'storeItem']);
        Route::put('cart/items/{id}', [CartController::class, 'updateItem']);
        Route::delete('cart/items/{id}', [CartController::class, 'destroyItem']);
        Route::delete('cart', [CartController::class, 'destroy']);

        // Orders
        Route::get('orders', [OrderController::class, 'index']);
        Route::post('orders', [OrderController::class, 'store']);
        Route::get('orders/{id}', [OrderController::class, 'show']);
        Route::post('orders/{id}/cancel', [OrderController::class, 'cancel']);

        // Farmer portal (farmers view their own data)
        Route::prefix('farmer')->middleware('role:farmer')->group(function () {
            Route::get('dashboard', [FarmerPortalController::class, 'dashboard']);
            Route::get('farms', [FarmerPortalController::class, 'farms']);
            Route::get('harvests', [FarmerPortalController::class, 'harvests']);
            Route::get('sourcing-records', [FarmerPortalController::class, 'sourcingRecords']);
            Route::get('earnings', [FarmerPortalController::class, 'earnings']);
        });

        // ============================================
        // ADMIN ROUTES (Simplified - role based only)
        // ============================================

Route::prefix('admin')->middleware('role:superadmin,admin,staff,warehouse_manager')->group(function () {

            // My access (current user info for frontend - always allowed for admin panel users)
            Route::get('access/my', [AccessController::class, 'myAccess']);

            // Users management (superadmin only)
            Route::middleware('role:superadmin')->group(function () {
                Route::get('users', [UserAdminController::class, 'index']);
                Route::get('users/{id}', [UserAdminController::class, 'show']);
                Route::post('users', [UserAdminController::class, 'store']);
                Route::put('users/{id}', [UserAdminController::class, 'update']);
                Route::delete('users/{id}', [UserAdminController::class, 'destroy']);
                Route::post('users/{id}/toggle', [UserAdminController::class, 'toggle']);
                Route::put('users/{id}/roles', [UserAdminController::class, 'updateRoles']);
                Route::put('users/{id}/permissions', [UserAdminController::class, 'updatePermissions']);

                // Roles & permissions management (superadmin only)
                Route::get('roles', [RoleAdminController::class, 'index']);
                Route::get('roles/{id}', [RoleAdminController::class, 'show']);
                Route::post('roles', [RoleAdminController::class, 'store']);
                Route::put('roles/{id}', [RoleAdminController::class, 'update']);
                Route::delete('roles/{id}', [RoleAdminController::class, 'destroy']);
                Route::put('roles/{id}/permissions', [RoleAdminController::class, 'updatePermissions']);
                Route::get('access/catalog', [AccessController::class, 'catalog']);
            });

            // ============================================
// Dashboard (needs dashboard.view)
            Route::get('dashboard', [DashboardController::class, 'summary'])->middleware('permission:dashboard.view');
            Route::get('dashboard/stats', [DashboardController::class, 'stats'])->middleware('permission:dashboard.view');
            Route::get('dashboard/sales-chart', [DashboardController::class, 'salesChart'])->middleware('permission:dashboard.view');
            Route::get('dashboard/top-products', [DashboardController::class, 'topProducts'])->middleware('permission:dashboard.view');
            Route::get('dashboard/top-farms', [DashboardController::class, 'topFarms'])->middleware('permission:dashboard.view');

            // Customers (needs customer.view)
            Route::get('customers', [CustomerController::class, 'index'])->middleware('permission:customer.view');
            Route::get('customers/{id}', [CustomerController::class, 'show'])->middleware('permission:customer.view');
            Route::post('customers', [CustomerController::class, 'store'])->middleware('permission:customer.view');

            // Orders (order permissions)
            Route::get('orders', [OrderController::class, 'index'])->middleware('permission:order.view');
            Route::get('orders/{id}', [OrderController::class, 'show'])->middleware('permission:order.view');
            Route::post('orders/{id}/confirm', [OrderController::class, 'confirm'])->middleware('permission:order.update');
            Route::post('orders/{id}/status', [OrderController::class, 'updateStatus'])->middleware('permission:order.status.update');

            // Units (needed for product forms - product.view)
            Route::get('units', [UnitController::class, 'index'])->middleware('permission:product.view');

            // Products (permission protected)
            Route::get('products', [ProductController::class, 'index'])->middleware('permission:product.view');
            Route::get('products/{id}', [ProductController::class, 'show'])->middleware('permission:product.view');
            Route::post('products', [ProductController::class, 'store'])->middleware('permission:product.create');
            Route::put('products/{id}', [ProductController::class, 'update'])->middleware('permission:product.update');
            Route::delete('products/{id}', [ProductController::class, 'destroy'])->middleware('permission:product.delete');

            // Categories (permission protected)
            Route::get('categories', [CategoryController::class, 'index'])->middleware('permission:category.view');
            Route::get('categories/{slug}', [CategoryController::class, 'show'])->middleware('permission:category.view');
            Route::post('categories', [CategoryController::class, 'store'])->middleware('permission:category.create');
            Route::put('categories/{id}', [CategoryController::class, 'update'])->middleware('permission:category.update');
            Route::delete('categories/{id}', [CategoryController::class, 'destroy'])->middleware('permission:category.delete');

            // Farmers (permission protected)
            Route::get('farmers', [FarmerController::class, 'index'])->middleware('permission:farmer.view');
            Route::get('farmers/{id}', [FarmerController::class, 'show'])->middleware('permission:farmer.view');
            Route::post('farmers', [FarmerController::class, 'store'])->middleware('permission:farmer.create');
            Route::put('farmers/{id}', [FarmerController::class, 'update'])->middleware('permission:farmer.update');
            Route::delete('farmers/{id}', [FarmerController::class, 'destroy'])->middleware('permission:farmer.delete');

            // Farms (permission protected)
            Route::get('farms', [FarmController::class, 'index'])->middleware('permission:farm.view');
            Route::get('farms/{id}', [FarmController::class, 'show'])->middleware('permission:farm.view');
            Route::post('farms', [FarmController::class, 'store'])->middleware('permission:farm.create');
            Route::put('farms/{id}', [FarmController::class, 'update'])->middleware('permission:farm.update');
            Route::delete('farms/{id}', [FarmController::class, 'destroy'])->middleware('permission:farm.delete');

            // Harvests (permission protected)
            Route::get('harvests', [HarvestController::class, 'index'])->middleware('permission:harvest.view');
            Route::get('harvests/{id}', [HarvestController::class, 'show'])->middleware('permission:harvest.view');
            Route::post('harvests', [HarvestController::class, 'store'])->middleware('permission:harvest.manage');
            Route::put('harvests/{id}', [HarvestController::class, 'update'])->middleware('permission:harvest.manage');
                        Route::delete('harvests/{id}', [HarvestController::class, 'destroy'])->middleware('permission:harvest.manage');

                        // Harvest batches (permission protected)
            Route::get('batches', [BatchController::class, 'index'])->middleware('permission:batch.view');
            Route::get('batches/{id}', [BatchController::class, 'show'])->middleware('permission:batch.view');
            Route::post('batches', [BatchController::class, 'store'])->middleware('permission:batch.manage');

            // Sourcing (permission protected)
            Route::get('sourcing-records', [SourcingController::class, 'index'])->middleware('permission:sourcing.view');
            Route::get('sourcing-records/{id}', [SourcingController::class, 'show'])->middleware('permission:sourcing.view');
            Route::post('sourcing-records', [SourcingController::class, 'store'])->middleware('permission:sourcing.manage');
            Route::post('sourcing-records/{id}/receive', [SourcingController::class, 'receive'])->middleware('permission:sourcing.manage');
            Route::delete('sourcing-records/{id}', [SourcingController::class, 'destroy'])->middleware('permission:sourcing.manage');
// Warehouses (permission protected)
            Route::get('warehouses', [WarehouseController::class, 'index'])->middleware('permission:warehouse.view');
            Route::get('warehouses/{id}', [WarehouseController::class, 'show'])->middleware('permission:warehouse.view');
            Route::post('warehouses', [WarehouseController::class, 'store'])->middleware('permission:warehouse.manage');
            Route::put('warehouses/{id}', [WarehouseController::class, 'update'])->middleware('permission:warehouse.manage');
            Route::delete('warehouses/{id}', [WarehouseController::class, 'destroy'])->middleware('permission:warehouse.manage');

            // Inventory (permission protected)
            Route::get('inventory', [InventoryController::class, 'index'])->middleware('permission:inventory.view');
            Route::get('inventory/{id}', [InventoryController::class, 'show'])->middleware('permission:inventory.view');
            Route::get('inventory/{id}/movements', [InventoryController::class, 'movements'])->middleware('permission:inventory.view');
            Route::post('inventory/receive', [InventoryController::class, 'receive'])->middleware('permission:inventory.adjust');
            Route::post('inventory/{id}/stock-out', [InventoryController::class, 'stockOut'])->middleware('permission:inventory.adjust');
            Route::post('inventory/{id}/adjust', [InventoryController::class, 'adjust'])->middleware('permission:inventory.adjust');
            Route::post('inventory/transfer', [InventoryController::class, 'transfer'])->middleware('permission:inventory.adjust');
            Route::get('traceability/{orderItemId}', [InventoryController::class, 'traceability'])->middleware('permission:inventory.view');

            // Quality Checks (permission protected)
            Route::get('quality-checks', [QualityCheckController::class, 'index'])->middleware('permission:quality-check.view');
            Route::get('quality-checks/{id}', [QualityCheckController::class, 'show'])->middleware('permission:quality-check.view');
            Route::post('quality-checks', [QualityCheckController::class, 'store'])->middleware('permission:quality-check.manage');
            Route::put('quality-checks/{id}', [QualityCheckController::class, 'update'])->middleware('permission:quality-check.manage');
            Route::delete('quality-checks/{id}', [QualityCheckController::class, 'destroy'])->middleware('permission:quality-check.manage');

            // Coupons (permission protected)
            Route::get('coupons', [CouponController::class, 'index'])->middleware('permission:coupon.view');
            Route::get('coupons/{id}', [CouponController::class, 'show'])->middleware('permission:coupon.view');
            Route::post('coupons', [CouponController::class, 'store'])->middleware('permission:coupon.manage');
            Route::put('coupons/{id}', [CouponController::class, 'update'])->middleware('permission:coupon.manage');
            Route::delete('coupons/{id}', [CouponController::class, 'destroy'])->middleware('permission:coupon.manage');
            Route::post('coupons/{id}/toggle', [CouponController::class, 'toggle'])->middleware('permission:coupon.manage');
// Packaging Types (permission protected)
            Route::get('packaging-types', [PackagingTypeController::class, 'index'])->middleware('permission:packaging.view');
            Route::get('packaging-types/{id}', [PackagingTypeController::class, 'show'])->middleware('permission:packaging.view');
            Route::post('packaging-types', [PackagingTypeController::class, 'store'])->middleware('permission:packaging.manage');
            Route::put('packaging-types/{id}', [PackagingTypeController::class, 'update'])->middleware('permission:packaging.manage');
            Route::delete('packaging-types/{id}', [PackagingTypeController::class, 'destroy'])->middleware('permission:packaging.manage');
            Route::post('packaging-types/{id}/toggle', [PackagingTypeController::class, 'toggle'])->middleware('permission:packaging.manage');

            // Packaging Items (permission protected)
            Route::get('packaging-items', [PackagingItemController::class, 'index'])->middleware('permission:packaging.view');
            Route::get('packaging-items/{id}', [PackagingItemController::class, 'show'])->middleware('permission:packaging.view');
            Route::post('packaging-items', [PackagingItemController::class, 'store'])->middleware('permission:packaging.manage');
            Route::put('packaging-items/{id}', [PackagingItemController::class, 'update'])->middleware('permission:packaging.manage');
            Route::delete('packaging-items/{id}', [PackagingItemController::class, 'destroy'])->middleware('permission:packaging.manage');
            Route::get('packaging-items/{id}/movements', [PackagingItemController::class, 'movements'])->middleware('permission:packaging.view');
// Delivery Agents (permission protected)
            Route::get('delivery-agents', [DeliveryAgentController::class, 'index'])->middleware('permission:delivery.view');
            Route::get('delivery-agents/{id}', [DeliveryAgentController::class, 'show'])->middleware('permission:delivery.view');
            Route::post('delivery-agents', [DeliveryAgentController::class, 'store'])->middleware('permission:delivery.assign');
            Route::put('delivery-agents/{id}', [DeliveryAgentController::class, 'update'])->middleware('permission:delivery.update');
            Route::delete('delivery-agents/{id}', [DeliveryAgentController::class, 'destroy'])->middleware('permission:delivery.assign');
            Route::post('delivery-agents/{id}/toggle', [DeliveryAgentController::class, 'toggle'])->middleware('permission:delivery.assign');

            // Delivery Zones (permission protected)
            Route::get('delivery-zones', [DeliveryZoneController::class, 'index'])->middleware('permission:delivery.view');
            Route::get('delivery-zones/{id}', [DeliveryZoneController::class, 'show'])->middleware('permission:delivery.view');
            Route::post('delivery-zones', [DeliveryZoneController::class, 'store'])->middleware('permission:delivery.assign');
            Route::put('delivery-zones/{id}', [DeliveryZoneController::class, 'update'])->middleware('permission:delivery.assign');
            Route::delete('delivery-zones/{id}', [DeliveryZoneController::class, 'destroy'])->middleware('permission:delivery.assign');
            Route::post('delivery-zones/{id}/toggle', [DeliveryZoneController::class, 'toggle'])->middleware('permission:delivery.assign');

            // Deliveries (permission protected)
            Route::get('deliveries', [DeliveryController::class, 'index'])->middleware('permission:delivery.view');
            Route::get('deliveries/{id}', [DeliveryController::class, 'show'])->middleware('permission:delivery.view');
            Route::post('deliveries', [DeliveryController::class, 'store'])->middleware('permission:delivery.assign');
            Route::post('deliveries/{id}/assign', [DeliveryController::class, 'assign'])->middleware('permission:delivery.assign');
            Route::post('deliveries/{id}/status', [DeliveryController::class, 'updateStatus'])->middleware('permission:delivery.update');

            // Audit Logs (permission protected)
            Route::get('audit-logs', [AuditLogController::class, 'index'])->middleware('permission:audit.view');
            Route::get('audit-logs/{id}', [AuditLogController::class, 'show'])->middleware('permission:audit.view');
            Route::delete('audit-logs/{id}', [AuditLogController::class, 'destroy'])->middleware('permission:audit.view');
            Route::delete('audit-logs/cleanup', [AuditLogController::class, 'destroyOld'])->middleware('permission:audit.view');
        });
    });
});