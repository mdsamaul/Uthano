<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HarvestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'harvest_code' => $this->harvest_code,
            'harvest_date' => $this->harvest_date?->toDateString(),
            'estimated_quantity' => (float) $this->estimated_quantity,
            'actual_quantity' => (float) $this->actual_quantity,
            'quality_grade' => $this->quality_grade,
            'status' => $this->status,
            'notes' => $this->notes,
            'farm' => $this->whenLoaded('farm', fn () => [
                'id' => $this->farm->id,
                'farm_code' => $this->farm->farm_code,
                'farm_name' => $this->farm->farm_name,
                'district' => $this->farm->district,
                'upazila' => $this->farm->upazila,
                'village' => $this->farm->village,
                'farmer' => $this->whenLoaded('farm.farmer', fn () => [
                    'id' => $this->farm->farmer->id,
                    'farmer_code' => $this->farm->farmer->farmer_code,
                    'full_name' => $this->farm->farmer->full_name,
                ]),
            ]),
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku' => $this->product->sku,
            ]),
            'quantity_unit' => $this->whenLoaded('quantityUnit', fn () => [
                'id' => $this->quantityUnit->id,
                'name' => $this->quantityUnit->name,
                'symbol' => $this->quantityUnit->symbol,
            ]),
            'batches' => $this->whenLoaded('batches', fn () => $this->batches->map(fn ($batch) => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'quantity' => (float) $batch->quantity,
                'remaining_quantity' => (float) $batch->remaining_quantity,
                'quality_grade' => $batch->quality_grade,
                'status' => $batch->status,
            ])),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}