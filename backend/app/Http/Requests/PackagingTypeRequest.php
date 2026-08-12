<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PackagingTypeRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:packaging_types,code,' . $this->route('id')],
            'description' => ['nullable', 'string', 'max:1000'],
            'capacity' => ['required', 'numeric', 'min:0'],
            'capacity_unit' => ['required', 'string', 'max:50'],
            'is_reusable' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Packaging type name is required',
            'code.required' => 'Packaging type code is required',
            'code.unique' => 'Packaging type code already exists',
            'capacity.required' => 'Capacity is required',
            'capacity_unit.required' => 'Capacity unit is required',
        ];
    }
}