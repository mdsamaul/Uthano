<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarehouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'warehouse_code' => $this->warehouse_code,
            'name' => $this->name,
            'type' => $this->type,
            'address' => $this->address,
            'district' => $this->district,
            'area' => $this->area,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'manager' => $this->whenLoaded('manager', fn () => [
                'id' => $this->manager->id,
                'name' => $this->manager->name,
                'email' => $this->manager->email,
            ]),
            'status' => $this->status,
            'inventory_items_count' => $this->whenCounted('inventoryItems'),
            'inventory_items' => $this->whenLoaded('inventoryItems', fn () => $this->inventoryItems->map(fn ($item) => [
                'id' => $item->id,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                ] : null,
                'batch_code' => $item->harvestBatch?->batch_code,
                'quantity' => (float) $item->quantity,
                'reserved_quantity' => (float) $item->reserved_quantity,
                'available_quantity' => (float) $item->available_quantity,
                'status' => $item->status,
            ])),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}