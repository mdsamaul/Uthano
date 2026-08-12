<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerAddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'division' => $this->division,
            'district' => $this->district,
            'upazila' => $this->upazila,
            'area' => $this->area,
            'address_line' => $this->address_line,
            'postal_code' => $this->postal_code,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'address_type' => $this->address_type,
            'is_default' => $this->is_default,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}