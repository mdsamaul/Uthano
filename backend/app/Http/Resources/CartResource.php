<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('items', $this->items, collect());

        return [
            'id' => $this->id,
            'items' => $items->map(fn ($item) => [
                'id' => $item->id,
                'product' => new ProductResource($item->product),
                'quantity' => (float) $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
            ]),
            'items_count' => $items->count(),
            'subtotal' => (float) $items->sum('total'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}