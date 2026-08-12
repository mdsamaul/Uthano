<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackagingItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'packaging_type' => $this->whenLoaded('packagingType', fn () => [
                'id' => $this->packagingType->id,
                'name' => $this->packagingType->name,
                'code' => $this->packagingType->code,
            ]),
            'warehouse' => $this->whenLoaded('warehouse', fn () => [
                'id' => $this->warehouse->id,
                'name' => $this->warehouse->name,
            ]),
            'code' => $this->code,
            'status' => $this->status,
            'current_quantity' => (float) $this->current_quantity,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}