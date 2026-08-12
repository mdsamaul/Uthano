<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FarmerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $farmerId = $this->route('farmer')?->id;

        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20', 'unique:farmers,phone,' . $farmerId],
            'alternate_phone' => ['nullable', 'string', 'max:20'],
            'national_id' => ['nullable', 'string', 'max:50'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE,SUSPENDED'],
            'verification_status' => ['nullable', 'in:PENDING,VERIFIED,REJECTED'],
            'notes' => ['nullable', 'string'],
        ];
    }
}