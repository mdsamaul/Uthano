<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'exists:orders,id'],
            'delivery_zone_id' => ['nullable', 'exists:delivery_zones,id'],
            'pickup_warehouse_id' => ['nullable', 'exists:warehouses,id'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
            'customer_note' => ['nullable', 'string'],
        ];
    }
}