<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin() ?? false;

        $inventoryItem = $this->inventoryItems->first();
        $batch = $inventoryItem?->harvestBatch;
        $harvest = $batch?->harvest;
        $farm = $harvest?->farm;

        $availableQty = $inventoryItem?->available_quantity ?? 0;
        $stockStatus = $availableQty <= 0
            ? 'out_of_stock'
            : ($availableQty < 20 ? 'low_stock' : 'in_stock');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'sku' => $this->sku,
            'product_type' => $this->product_type,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'unit' => $this->unit?->symbol ?? 'kg',
            'unit_id' => $this->unit_id,
            'is_active' => $this->is_active,
            'price' => (float) $this->selling_price,
            'base_price' => (float) $this->base_price,
            'cost_price' => $isAdmin ? (float) $this->cost_price : null,
            'discount_price' => $this->when(
                $this->base_price > $this->selling_price,
                (float) $this->base_price
            ),
            'min_order_qty' => (float) $this->minimum_order_quantity,
            'max_order_qty' => $this->when($isAdmin, (float) $this->maximum_order_quantity),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($img) => [
                'id' => $img->id,
                'url' => $img->image_url ?? $img->image_path,
                'alt' => $img->alt_text,
                'is_primary' => $img->is_primary,
                'sort_order' => $img->sort_order,
            ])),
            // Reflect the real lifecycle status stored in the DB
            // (DRAFT/ACTIVE/INACTIVE/DISCONTINUED) instead of deriving it
            // from `is_active`, so admins can distinguish e.g. DRAFT from
            // ACTIVE products. `is_active` stays a separate flag.
            'status' => strtolower($this->status ?? 'draft'),
            'featured' => $this->is_featured,
            'is_seasonal' => $this->product_type === 'SEASONAL',
            'rating' => $this->whenLoaded('reviews', fn () => round($this->reviews->avg('rating'), 1), 0),
            'review_count' => $this->whenCounted('reviews', 0),
            'stock_status' => $stockStatus,
            'available_qty' => $availableQty,
            'farm_id' => $farm?->id,
            'farm' => $farm ? [
                'id' => $farm->id,
                'name' => $farm->farm_name,
                'district' => $farm->district,
                'upazila' => $farm->upazila,
            ] : null,
            'source_district' => $farm?->district,
            'harvest_date' => $harvest?->harvest_date?->toDateString(),
            'quality_grade' => $harvest?->quality_grade,
            'source_summary' => $this->when(
                $this->relationLoaded('inventoryItems') && $this->inventoryItems->isNotEmpty(),
                fn () => $this->buildSourceSummary($isAdmin)
            ),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function buildSourceSummary(bool $isAdmin): array
    {
        $item = $this->inventoryItems->first();
        $batch = $item->harvestBatch;

        if (!$batch) {
            return [];
        }

        $harvest = $batch->harvest;
        $farm = $harvest?->farm;

        return [
            'batch_code' => $batch->batch_code,
            'harvest_date' => $harvest?->harvest_date?->toDateString(),
            'district' => $farm?->district,
            'farm_name' => $farm?->farm_name,
            // Only expose farmer details to authorized users
            'farmer' => $isAdmin ? [
                'id' => $farm?->farmer?->id,
                'full_name' => $farm?->farmer?->full_name,
            ] : null,
        ];
    }
}