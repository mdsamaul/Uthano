<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FarmResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'farm_code' => $this->farm_code,
            'farm_name' => $this->farm_name,
            'division' => $this->division,
            'district' => $this->district,
            'upazila' => $this->upazila,
            'union' => $this->union,
            'village' => $this->village,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'land_area' => $this->land_area,
            'land_area_unit' => $this->land_area_unit,
            'soil_type' => $this->soil_type,
            'irrigation_type' => $this->irrigation_type,
            'farming_method' => $this->farming_method,
            'status' => $this->status,
            'verification_status' => $this->verification_status,
            'notes' => $this->notes,
            'farmer' => $this->whenLoaded('farmer', fn () => [
                'id' => $this->farmer->id,
                'full_name' => $this->farmer->full_name,
                'farmer_code' => $this->farmer->farmer_code,
            ]),
            'crops_count' => $this->whenCounted('crops'),
            'harvests_count' => $this->whenCounted('harvests'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}