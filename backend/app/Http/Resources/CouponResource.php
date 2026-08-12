<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'value' => (float) $this->value,
            'minimum_order_amount' => (float) $this->minimum_order_amount,
            'maximum_discount' => (float) $this->maximum_discount,
            'start_at' => $this->start_at?->toISOString(),
            'end_at' => $this->end_at?->toISOString(),
            'usage_limit' => $this->usage_limit,
            'per_customer_limit' => $this->per_customer_limit,
            'is_active' => $this->is_active,
            'usages_count' => $this->whenLoaded('usages_count', $this->usages_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}