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

            // My access (current user info for frontend)
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
            });

            // Dashboard (all admin roles)
            Route::get('dashboard', [DashboardController::class, 'summary']);
            Route::get('dashboard/stats', [DashboardController::class, 'stats']);
            Route::get('dashboard/sales-chart', [DashboardController::class, 'salesChart']);
            Route::get('dashboard/top-products', [DashboardController::class, 'topProducts']);
            Route::get('dashboard/top-farms', [DashboardController::class, 'topFarms']);

            // Customers (all admin roles)
            Route::get('customers', [CustomerController::class, 'index']);
            Route::get('customers/{id}', [CustomerController::class, 'show']);

            // Orders (all admin roles)
            Route::get('orders', [OrderController::class, 'index']);
            Route::get('orders/{id}', [OrderController::class, 'show']);
            Route::post('orders/{id}/confirm', [OrderController::class, 'confirm']);
            Route::post('orders/{id}/status', [OrderController::class, 'updateStatus']);

            // Products (all admin roles)
            Route::get('products', [ProductController::class, 'index']);
            Route::get('products/{id}', [ProductController::class, 'show']);
            Route::post('products', [ProductController::class, 'store']);
            Route::put('products/{id}', [ProductController::class, 'update']);
            Route::delete('products/{id}', [ProductController::class, 'destroy']);

            // Units (all admin roles)
            Route::get('units', [UnitController::class, 'index']);

            // Categories (all admin roles)
            Route::get('categories', [CategoryController::class, 'index']);
            Route::get('categories/{slug}', [CategoryController::class, 'show']);
            Route::post('categories', [CategoryController::class, 'store']);
            Route::put('categories/{id}', [CategoryController::class, 'update']);
            Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

            // Farmers (all admin roles)
            Route::get('farmers', [FarmerController::class, 'index']);
            Route::get('farmers/{id}', [FarmerController::class, 'show']);
            Route::post('farmers', [FarmerController::class, 'store']);
            Route::put('farmers/{id}', [FarmerController::class, 'update']);
            Route::delete('farmers/{id}', [FarmerController::class, 'destroy']);

            // Farms (all admin roles)
            Route::get('farms', [FarmController::class, 'index']);
            Route::get('farms/{id}', [FarmController::class, 'show']);
            Route::post('farms', [FarmController::class, 'store']);
            Route::put('farms/{id}', [FarmController::class, 'update']);
            Route::delete('farms/{id}', [FarmController::class, 'destroy']);

            // Harvests (all admin roles)
            Route::get('harvests', [HarvestController::class, 'index']);
            Route::get('harvests/{id}', [HarvestController::class, 'show']);
            Route::post('harvests', [HarvestController::class, 'store']);
            Route::put('harvests/{id}', [HarvestController::class, 'update']);
            Route::delete('harvests/{id}', [HarvestController::class, 'destroy']);

            // Sourcing (all admin roles)
            Route::get('sourcing-records', [SourcingController::class, 'index']);
            Route::get('sourcing-records/{id}', [SourcingController::class, 'show']);
            Route::post('sourcing-records', [SourcingController::class, 'store']);
            Route::post('sourcing-records/{id}/receive', [SourcingController::class, 'receive']);
            Route::delete('sourcing-records/{id}', [SourcingController::class, 'destroy']);

            // Warehouses (all admin roles)
            Route::get('warehouses', [WarehouseController::class, 'index']);
            Route::get('warehouses/{id}', [WarehouseController::class, 'show']);
            Route::post('warehouses', [WarehouseController::class, 'store']);
            Route::put('warehouses/{id}', [WarehouseController::class, 'update']);
            Route::delete('warehouses/{id}', [WarehouseController::class, 'destroy']);

            // Inventory (all admin roles)
            Route::get('inventory', [InventoryController::class, 'index']);
            Route::get('inventory/{id}', [InventoryController::class, 'show']);
            Route::get('inventory/{id}/movements', [InventoryController::class, 'movements']);
            Route::post('inventory/{id}/adjust', [InventoryController::class, 'adjust']);
            Route::post('inventory/transfer', [InventoryController::class, 'transfer']);
            Route::get('traceability/{orderItemId}', [InventoryController::class, 'traceability']);

            // Quality Checks (all admin roles)
            Route::get('quality-checks', [QualityCheckController::class, 'index']);
            Route::get('quality-checks/{id}', [QualityCheckController::class, 'show']);
            Route::post('quality-checks', [QualityCheckController::class, 'store']);
            Route::put('quality-checks/{id}', [QualityCheckController::class, 'update']);
            Route::delete('quality-checks/{id}', [QualityCheckController::class, 'destroy']);
            Route::post('quality-checks/{id}/approve', [QualityCheckController::class, 'approve']);
            Route::post('quality-checks/{id}/reject', [QualityCheckController::class, 'reject']);

            // Product Reviews (all admin roles)
            Route::get('product-reviews', [ProductReviewController::class, 'index']);
            Route::get('product-reviews/{id}', [ProductReviewController::class, 'show']);
            Route::post('product-reviews', [ProductReviewController::class, 'store']);
            Route::put('product-reviews/{id}', [ProductReviewController::class, 'update']);
            Route::delete('product-reviews/{id}', [ProductReviewController::class, 'destroy']);
            Route::post('product-reviews/{id}/approve', [ProductReviewController::class, 'approve']);
            Route::post('product-reviews/{id}/reject', [ProductReviewController::class, 'reject']);

            // Coupons (all admin roles)
            Route::get('coupons', [CouponController::class, 'index']);
            Route::get('coupons/{id}', [CouponController::class, 'show']);
            Route::post('coupons', [CouponController::class, 'store']);
            Route::put('coupons/{id}', [CouponController::class, 'update']);
            Route::delete('coupons/{id}', [CouponController::class, 'destroy']);
            Route::post('coupons/{id}/toggle', [CouponController::class, 'toggle']);

            // Packaging Types (all admin roles)
            Route::get('packaging-types', [PackagingTypeController::class, 'index']);
            Route::get('packaging-types/{id}', [PackagingTypeController::class, 'show']);
            Route::post('packaging-types', [PackagingTypeController::class, 'store']);
            Route::put('packaging-types/{id}', [PackagingTypeController::class, 'update']);
            Route::delete('packaging-types/{id}', [PackagingTypeController::class, 'destroy']);
            Route::post('packaging-types/{id}/toggle', [PackagingTypeController::class, 'toggle']);

            // Packaging Items (all admin roles)
            Route::get('packaging-items', [PackagingItemController::class, 'index']);
            Route::get('packaging-items/{id}', [PackagingItemController::class, 'show']);
            Route::post('packaging-items', [PackagingItemController::class, 'store']);
            Route::put('packaging-items/{id}', [PackagingItemController::class, 'update']);
            Route::delete('packaging-items/{id}', [PackagingItemController::class, 'destroy']);
            Route::get('packaging-items/{id}/movements', [PackagingItemController::class, 'movements']);

            // Delivery Agents (all admin roles)
            Route::get('delivery-agents', [DeliveryAgentController::class, 'index']);
            Route::get('delivery-agents/{id}', [DeliveryAgentController::class, 'show']);
            Route::post('delivery-agents', [DeliveryAgentController::class, 'store']);
            Route::put('delivery-agents/{id}', [DeliveryAgentController::class, 'update']);
            Route::delete('delivery-agents/{id}', [DeliveryAgentController::class, 'destroy']);
            Route::post('delivery-agents/{id}/toggle', [DeliveryAgentController::class, 'toggle']);

            // Delivery Zones (all admin roles)
            Route::get('delivery-zones', [DeliveryZoneController::class, 'index']);
            Route::get('delivery-zones/{id}', [DeliveryZoneController::class, 'show']);
            Route::post('delivery-zones', [DeliveryZoneController::class, 'store']);
            Route::put('delivery-zones/{id}', [DeliveryZoneController::class, 'update']);
            Route::delete('delivery-zones/{id}', [DeliveryZoneController::class, 'destroy']);
            Route::post('delivery-zones/{id}/toggle', [DeliveryZoneController::class, 'toggle']);

            // Batches (all admin roles)
            Route::get('batches', [BatchController::class, 'index']);
            Route::get('batches/{id}', [BatchController::class, 'show']);

            // Deliveries (all admin roles)
            Route::get('deliveries', [DeliveryController::class, 'index']);
            Route::get('deliveries/{id}', [DeliveryController::class, 'show']);
            Route::post('deliveries', [DeliveryController::class, 'store']);
            Route::post('deliveries/{id}/assign', [DeliveryController::class, 'assign']);
            Route::post('deliveries/{id}/status', [DeliveryController::class, 'updateStatus']);

            // Audit Logs (all admin roles)
            Route::get('audit-logs', [AuditLogController::class, 'index']);
            Route::get('audit-logs/{id}', [AuditLogController::class, 'show']);
            Route::delete('audit-logs/{id}', [AuditLogController::class, 'destroy']);
            Route::delete('audit-logs/cleanup', [AuditLogController::class, 'destroyOld']);
        });
    });
});