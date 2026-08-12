<?php

namespace App\Providers;

use App\Models\Delivery;
use App\Models\Farm;
use App\Models\Farmer;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Product;
use App\Policies\DeliveryPolicy;
use App\Policies\FarmPolicy;
use App\Policies\FarmerPolicy;
use App\Policies\InventoryPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(Farmer::class, FarmerPolicy::class);
        Gate::policy(Farm::class, FarmPolicy::class);
        Gate::policy(InventoryItem::class, InventoryPolicy::class);
        Gate::policy(Delivery::class, DeliveryPolicy::class);
    }
}