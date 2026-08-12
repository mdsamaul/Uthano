<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SourcingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'farmer_id' => ['required', 'exists:farmers,id'],
            'farm_id' => ['required', 'exists:farms,id'],
            'harvest_batch_id' => ['required', 'exists:harvest_batches,id'],
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_id' => ['required', 'exists:units,id'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'transport_cost' => ['nullable', 'numeric', 'min:0'],
            'packaging_cost' => ['nullable', 'numeric', 'min:0'],
            'other_cost' => ['nullable', 'numeric', 'min:0'],
            'sourced_at' => ['nullable', 'date'],
            'warehouse_id' => ['nullable', 'exists:warehouses,id'],
            'notes' => ['nullable', 'string'],
        ];
    }
}