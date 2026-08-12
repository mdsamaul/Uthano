<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QualityCheckRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'harvest_batch_id' => ['nullable', 'exists:harvest_batches,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'appearance' => ['required', 'string', 'max:255'],
            'freshness' => ['required', 'string', 'max:255'],
            'damaged_quantity' => ['required', 'numeric', 'min:0'],
            'accepted_quantity' => ['required', 'numeric', 'min:0'],
            'rejected_quantity' => ['required', 'numeric', 'min:0'],
            'grade' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', Rule::in(['PENDING', 'APPROVED', 'REJECTED'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Product is required',
            'warehouse_id.required' => 'Warehouse is required',
            'appearance.required' => 'Appearance is required',
            'freshness.required' => 'Freshness is required',
            'damaged_quantity.required' => 'Damaged quantity is required',
            'accepted_quantity.required' => 'Accepted quantity is required',
            'rejected_quantity.required' => 'Rejected quantity is required',
        ];
    }
}