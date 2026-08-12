<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_code' => $this->customer_code,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'alternate_phone' => $this->alternate_phone,
            'photo' => $this->photo,
            'status' => $this->status,
            'addresses' => CustomerAddressResource::collection($this->whenLoaded('addresses')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}