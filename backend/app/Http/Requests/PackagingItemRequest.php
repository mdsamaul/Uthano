<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PackagingItemRequest extends FormRequest
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
            'packaging_type_id' => ['required', 'exists:packaging_types,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'code' => ['required', 'string', 'max:50', 'unique:packaging_items,code,' . $this->route('id')],
            'status' => ['nullable', Rule::in(['AVAILABLE', 'IN_USE', 'DAMAGED', 'RETIRED'])],
            'current_quantity' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'packaging_type_id.required' => 'Packaging type is required',
            'warehouse_id.required' => 'Warehouse is required',
            'code.required' => 'Packaging item code is required',
            'code.unique' => 'Packaging item code already exists',
        ];
    }
}