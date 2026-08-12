<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address_id' => ['required', 'exists:customer_addresses,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'in:COD,ONLINE'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'warehouse_id' => ['nullable', 'exists:warehouses,id'],
        ];
    }
}