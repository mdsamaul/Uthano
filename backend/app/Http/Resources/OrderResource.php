<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer_id' => $this->customer_id,
            'address' => $this->whenLoaded('address', fn () => [
                'id' => $this->address->id,
                'name' => $this->address->name,
                'phone' => $this->address->phone,
                'district' => $this->address->district,
                'upazila' => $this->address->upazila,
                'address_line' => $this->address->address_line,
            ]),
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'delivery_charge' => (float) $this->delivery_charge,
            'tax' => $this->tax !== null ? (float) $this->tax : null,
            'total' => (float) $this->total,
            'currency' => $this->currency,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'order_status' => $this->order_status,
            'notes' => $this->notes,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'sku' => $item->sku,
                'quantity' => (float) $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'discount' => (float) $item->discount,
                'total' => (float) $item->total,
                'source_batch_id' => $item->source_batch_id,
            ])),
            'status_histories' => $this->whenLoaded('statusHistories', fn () => $this->statusHistories->map(fn ($h) => [
                'status' => $h->status,
                'notes' => $h->notes,
                'changed_at' => $h->created_at?->toISOString(),
            ])),
            'delivery' => $this->whenLoaded('delivery', fn () => [
                'id' => $this->delivery->id,
                'delivery_code' => $this->delivery->delivery_code,
                'status' => $this->delivery->status,
                'assigned_at' => $this->delivery->assigned_at?->toISOString(),
                'delivered_at' => $this->delivery->delivered_at?->toISOString(),
                'delivery_fee' => (float) $this->delivery->delivery_fee,
            ]),
            'placed_at' => $this->placed_at?->toISOString(),
            'confirmed_at' => $this->confirmed_at?->toISOString(),
            'delivered_at' => $this->delivered_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}