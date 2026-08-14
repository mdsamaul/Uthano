<?php

namespace App\Services;

use App\Models\CustomerProfile;
use App\Models\Farmer;
use App\Models\Farm;
use App\Models\HarvestBatch;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getDashboardSummary(): array
    {
        $today = now()->startOfDay();

        return [
            'total_customers' => CustomerProfile::count(),
            'total_farmers' => Farmer::count(),
            'total_farms' => Farm::count(),
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'today_orders' => Order::where('placed_at', '>=', $today)->count(),
            'pending_orders' => Order::where('order_status', 'PENDING')->count(),
            'confirmed_orders' => Order::where('order_status', 'CONFIRMED')->count(),
            'processing_orders' => Order::whereIn('order_status', ['PROCESSING', 'PACKED', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'])->count(),
            'delivered_orders' => Order::where('order_status', 'DELIVERED')->count(),
            'cancelled_orders' => Order::whereIn('order_status', ['CANCELLED', 'RETURNED'])->count(),
            'total_sales' => Order::where('order_status', 'DELIVERED')->sum('total'),
            'today_sales' => Order::where('order_status', 'DELIVERED')
                ->where('delivered_at', '>=', $today)
                ->sum('total'),
            'total_inventory_quantity' => InventoryItem::sum('quantity'),
            'available_inventory_quantity' => InventoryItem::sum('available_quantity'),
            'low_stock_products' => $this->getLowStockProducts(),
            'expiring_batches' => $this->getExpiringBatches(),
            'damaged_quantity' => DB::table('inventory_movements')
                ->where('movement_type', 'DAMAGED')
                ->sum('quantity'),
            'top_products' => $this->getTopProducts(),
            'top_farmers' => $this->getTopFarmers(),
        ];
    }

    public function getStats(): array
    {
        $today = now()->startOfDay();

        return [
            'total_sales' => (float) Order::where('order_status', 'DELIVERED')->sum('total'),
            'today_orders' => Order::where('placed_at', '>=', $today)->count(),
            'pending_orders' => Order::where('order_status', 'PENDING')->count(),
            'total_customers' => CustomerProfile::count(),
            'total_farmers' => Farmer::count(),
            'total_products' => Product::count(),
            'low_stock_products' => $this->getLowStockProductsCount(),
            'pending_deliveries' => DB::table('deliveries')
                ->whereIn('status', ['PENDING', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'])
                ->count(),
        ];
    }

    public function getSalesChart(int $days = 30): array
    {
        $startDate = now()->subDays($days - 1)->startOfDay();

        $rows = Order::where('order_status', 'DELIVERED')
            ->where('placed_at', '>=', $startDate)
            ->selectRaw('DATE(placed_at) as date, SUM(total) as sales')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chart = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $key = $date->toDateString();
            $chart[] = [
                'date' => $key,
                'sales' => (float) ($rows[$key]->sales ?? 0),
            ];
        }

        return $chart;
    }

    public function getTopProducts(int $limit = 10): array
    {
        return DB::table('order_items')
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as total_sales')
            )
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sales')
            ->limit($limit)
            ->get()
            ->map(fn ($p) => [
                'product_id' => $p->product_id,
                'product_name' => $p->product_name,
                'total_quantity' => (float) $p->total_quantity,
                'total_sales' => (float) $p->total_sales,
            ])
            ->toArray();
    }

    public function getTopFarms(int $limit = 10): array
    {
        return DB::table('sourcing_records')
            ->select(
                'farms.id as farm_id',
                'farms.farm_name',
                DB::raw('SUM(sourcing_records.quantity) as total_supply'),
                DB::raw('SUM(sourcing_records.total_procurement_cost) as total_value')
            )
            ->join('farms', 'sourcing_records.farm_id', '=', 'farms.id')
            ->groupBy('farms.id', 'farms.farm_name')
            ->orderByDesc('total_value')
            ->limit($limit)
            ->get()
            ->map(fn ($f) => [
                'farm_id' => $f->farm_id,
                'farm_name' => $f->farm_name,
                'total_supply' => (float) $f->total_supply,
                'total_value' => (float) $f->total_value,
            ])
            ->toArray();
    }

    private function getLowStockProducts(): array
    {
        return Product::select('products.id', 'products.name', 'products.sku')
            ->selectRaw('COALESCE(SUM(inventory_items.available_quantity), 0) as total_available')
            ->leftJoin('inventory_items', 'products.id', '=', 'inventory_items.product_id')
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->having('total_available', '<=', 10)
            ->orderBy('total_available')
            ->limit(20)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'available_quantity' => (float) $p->total_available,
            ])
            ->toArray();
    }

    private function getLowStockProductsCount(): int
    {
        return Product::select('products.id')
            ->selectRaw('COALESCE(SUM(inventory_items.available_quantity), 0) as total_available')
            ->leftJoin('inventory_items', 'products.id', '=', 'inventory_items.product_id')
            ->groupBy('products.id')
            ->having('total_available', '<=', 10)
            ->count();
    }

    private function getExpiringBatches(): array
    {
        return HarvestBatch::where('expiry_date', '<=', now()->addDays(7))
            ->where('status', 'AVAILABLE')
            ->with('product:id,name')
            ->limit(10)
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'batch_code' => $b->batch_code,
                'product' => $b->product?->name,
                'remaining_quantity' => (float) $b->remaining_quantity,
                'expiry_date' => $b->expiry_date?->toDateString(),
            ])
            ->toArray();
    }

    private function getTopFarmers(): array
    {
        return DB::table('sourcing_records')
            ->select(
                'farmers.id',
                'farmers.full_name',
                DB::raw('SUM(sourcing_records.quantity) as total_quantity'),
                DB::raw('SUM(sourcing_records.total_procurement_cost) as total_value')
            )
            ->join('farmers', 'sourcing_records.farmer_id', '=', 'farmers.id')
            ->groupBy('farmers.id', 'farmers.full_name')
            ->orderByDesc('total_value')
            ->limit(10)
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'full_name' => $f->full_name,
                'total_quantity' => (float) $f->total_quantity,
                'total_value' => (float) $f->total_value,
            ])
            ->toArray();
    }
}