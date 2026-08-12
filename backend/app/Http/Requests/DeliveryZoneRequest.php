<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeliveryZoneRequest extends FormRequest
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
            'district' => ['required', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:1000'],
            'base_charge' => ['required', 'numeric', 'min:0'],
            'weight_based_charge' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', Rule::in(['ACTIVE', 'INACTIVE'])],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Zone name is required',
            'district.required' => 'District is required',
            'base_charge.required' => 'Base charge is required',
            'weight_based_charge.required' => 'Weight based charge is required',
        ];
    }
}