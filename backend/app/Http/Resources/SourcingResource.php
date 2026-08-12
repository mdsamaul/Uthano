<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SourcingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sourcing_code' => $this->sourcing_code,
            'quantity' => (float) $this->quantity,
            'purchase_price' => (float) $this->purchase_price,
            'total_cost' => (float) $this->total_cost,
            'transport_cost' => (float) $this->transport_cost,
            'packaging_cost' => (float) $this->packaging_cost,
            'other_cost' => (float) $this->other_cost,
            'total_procurement_cost' => (float) $this->total_procurement_cost,
            'sourced_at' => $this->sourced_at?->toISOString(),
            'received_at' => $this->received_at?->toISOString(),
            'status' => $this->status,
            'notes' => $this->notes,
            'farmer' => $this->whenLoaded('farmer', fn () => [
                'id' => $this->farmer->id,
                'farmer_code' => $this->farmer->farmer_code,
                'full_name' => $this->farmer->full_name,
            ]),
            'farm' => $this->whenLoaded('farm', fn () => [
                'id' => $this->farm->id,
                'farm_code' => $this->farm->farm_code,
                'farm_name' => $this->farm->farm_name,
                'district' => $this->farm->district,
            ]),
            'harvest_batch' => $this->whenLoaded('harvestBatch', fn () => [
                'id' => $this->harvestBatch->id,
                'batch_code' => $this->harvestBatch->batch_code,
                'status' => $this->harvestBatch->status,
            ]),
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku' => $this->product->sku,
            ]),
            'unit' => $this->whenLoaded('unit', fn () => [
                'id' => $this->unit->id,
                'name' => $this->unit->name,
                'symbol' => $this->unit->symbol,
            ]),
            'warehouse' => $this->whenLoaded('warehouse', fn () => [
                'id' => $this->warehouse->id,
                'warehouse_code' => $this->warehouse->warehouse_code,
                'name' => $this->warehouse->name,
                'district' => $this->warehouse->district,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}