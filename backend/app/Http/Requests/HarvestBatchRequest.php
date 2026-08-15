<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HarvestBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'harvest_id' => ['required', 'exists:harvests,id'],
            'product_id' => ['required', 'exists:products,id'],
            'batch_code' => ['nullable', 'string', 'max:100', 'unique:harvest_batches,batch_code'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'remaining_quantity' => ['nullable', 'numeric', 'min:0'],
            'unit_id' => ['required', 'exists:units,id'],
            'quality_grade' => ['required', 'string', 'max:50'],
            'harvested_at' => ['required', 'date'],
            'expiry_date' => ['nullable', 'date', 'after:harvested_at'],
            'status' => ['nullable', 'in:CREATED,COLLECTED,IN_TRANSIT,RECEIVED,AVAILABLE,PARTIALLY_SOLD,SOLD_OUT,REJECTED,EXPIRED'],
        ];
    }
}
