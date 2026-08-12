<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ProductService
{
    public function query(Request $request): Builder
    {
        $query = Product::query()
            ->with(['category', 'unit', 'images', 'inventoryItems.harvestBatch.harvest.farm.farmer'])
            ->withCount('reviews');

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhereHas('category', function (Builder $cat) use ($search) {
                        $cat->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Category filter
        if ($request->has('category') && $request->category) {
            $query->where('category_id', $request->category);
        }

        // Price range
        if ($request->has('min_price')) {
            $query->where('selling_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('selling_price', '<=', $request->max_price);
        }

        // Featured
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Availability
        if ($request->boolean('in_stock')) {
            $query->whereHas('inventoryItems', function (Builder $q) {
                $q->where('available_quantity', '>', 0);
            });
        }

        // District filter
        if ($request->has('district') && $request->district) {
            $query->whereHas('inventoryItems.harvestBatch.harvest.farm', function (Builder $q) use ($request) {
                $q->where('district', $request->district);
            });
        }

        // Only show active products to public
        $user = $request->user();
        if (!$user?->isAdmin()) {
            $query->where('is_active', true)->where('status', 'ACTIVE');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $allowedSorts = ['name', 'selling_price', 'created_at', 'base_price'];
        $query->orderBy(in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at', $sortDirection === 'asc' ? 'asc' : 'desc');

        return $query;
    }

    public function getProduct(int $id): Product
    {
        return Product::with([
            'category',
            'unit',
            'images',
            'variants',
            'reviews.customer',
            'inventoryItems.harvestBatch.harvest.farm.farmer',
            'inventoryItems.warehouse',
        ])->findOrFail($id);
    }

    public function getProductBySlug(string $slug): Product
    {
        return Product::with([
            'category',
            'unit',
            'images',
            'variants',
            'reviews.customer',
            'inventoryItems.harvestBatch.harvest.farm.farmer',
            'inventoryItems.warehouse',
        ])->where('slug', $slug)->firstOrFail();
    }
}
