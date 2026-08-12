<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryZoneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'district' => $this->district,
            'area' => $this->area,
            'base_charge' => (float) $this->base_charge,
            'weight_based_charge' => (float) $this->weight_based_charge,
            'status' => $this->status,
            'deliveries_count' => $this->whenLoaded('deliveries_count', $this->deliveries_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}