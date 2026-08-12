<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QualityCheckResource extends JsonResource
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
            ]),
            'warehouse' => $this->whenLoaded('warehouse', fn () => [
                'id' => $this->warehouse->id,
                'name' => $this->warehouse->name,
                'location' => $this->warehouse->location,
            ]),
            'checked_by' => $this->whenLoaded('checkedBy', fn () => [
                'id' => $this->checkedBy->id,
                'name' => $this->checkedBy->name,
            ]),
            'checked_at' => $this->checked_at?->toISOString(),
            'appearance' => $this->appearance,
            'freshness' => $this->freshness,
            'damaged_quantity' => (float) $this->damaged_quantity,
            'accepted_quantity' => (float) $this->accepted_quantity,
            'rejected_quantity' => (float) $this->rejected_quantity,
            'grade' => $this->grade,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}