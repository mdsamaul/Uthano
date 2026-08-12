<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackagingTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'capacity' => (float) $this->capacity,
            'capacity_unit' => $this->capacity_unit,
            'is_reusable' => $this->is_reusable,
            'is_active' => $this->is_active,
            'packaging_items_count' => $this->whenLoaded('packaging_items_count', $this->packaging_items_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}