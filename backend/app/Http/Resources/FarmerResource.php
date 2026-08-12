<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FarmerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin() ?? false;

        return [
            'id' => $this->id,
            'farmer_code' => $this->farmer_code,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'alternate_phone' => $this->alternate_phone,
            'photo' => $this->photo,
            'status' => $this->status,
            'verification_status' => $this->verification_status,
            'notes' => $this->notes,
            'national_id' => $isAdmin ? $this->national_id : null,
            'farms_count' => $this->whenCounted('farms'),
            'farms' => FarmResource::collection($this->whenLoaded('farms')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}