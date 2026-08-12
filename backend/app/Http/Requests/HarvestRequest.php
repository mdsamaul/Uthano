<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HarvestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'farm_id' => ['required', 'exists:farms,id'],
            'farm_crop_id' => ['nullable', 'exists:farm_crops,id'],
            'product_id' => ['required', 'exists:products,id'],
            'harvest_date' => ['required', 'date'],
            'estimated_quantity' => ['nullable', 'numeric', 'min:0'],
            'actual_quantity' => ['required', 'numeric', 'min:0.01'],
            'quantity_unit_id' => ['required', 'exists:units,id'],
            'quality_grade' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:RECORDED,QUALITY_CHECKED,BATCHED,REJECTED'],
            'notes' => ['nullable', 'string'],
        ];
    }
}