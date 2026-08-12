<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Map 'address' to 'address_line' so both field names are accepted.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('address') && !$this->has('address_line')) {
            $this->merge([
                'address_line' => $this->input('address'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'division' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
            'upazila' => ['required', 'string', 'max:100'],
            'area' => ['nullable', 'string', 'max:100'],
            'address_line' => ['required', 'string', 'max:500'],
            'address' => ['sometimes', 'string', 'max:500'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,90'],
            'address_type' => ['nullable', 'in:HOME,OFFICE,OTHER'],
            'is_default' => ['nullable', 'boolean'],
        ];
    }
}
