<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku' => $this->product->sku,
            ]),
            'harvest_batch' => $this->whenLoaded('harvestBatch', fn () => [
                'id' => $this->harvestBatch->id,
                'batch_code' => $this->harvestBatch->batch_code,
                'status' => $this->harvestBatch->status,
                'harvest' => $this->whenLoaded('harvestBatch.harvest', fn () => [
                    'id' => $this->harvestBatch->harvest->id,
                    'harvest_code' => $this->harvestBatch->harvest->harvest_code,
                    'harvest_date' => $this->harvestBatch->harvest->harvest_date?->toDateString(),
                    'farm' => $this->whenLoaded('harvestBatch.harvest.farm', fn () => [
                        'id' => $this->harvestBatch->harvest->farm->id,
                        'farm_name' => $this->harvestBatch->harvest->farm->farm_name,
                        'district' => $this->harvestBatch->harvest->farm->district,
                        'farmer' => $this->whenLoaded('harvestBatch.harvest.farm.farmer', fn () => [
                            'id' => $this->harvestBatch->harvest->farm->farmer->id,
                            'full_name' => $this->harvestBatch->harvest->farm->farmer->full_name,
                        ]),
                    ]),
                ]),
            ]),
            'warehouse' => $this->whenLoaded('warehouse', fn () => [
                'id' => $this->warehouse->id,
                'name' => $this->warehouse->name,
                'warehouse_code' => $this->warehouse->warehouse_code,
                'district' => $this->warehouse->district,
            ]),
            'quantity' => (float) $this->quantity,
            'reserved_quantity' => (float) $this->reserved_quantity,
            'available_quantity' => (float) $this->available_quantity,
            'unit' => $this->whenLoaded('unit', fn () => [
                'id' => $this->unit->id,
                'name' => $this->unit->name,
                'symbol' => $this->unit->symbol,
            ]),
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}