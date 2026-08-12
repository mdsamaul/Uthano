<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FarmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $farmId = $this->route('farm')?->id;

        return [
            'farmer_id' => ['required', 'exists:farmers,id'],
            'farm_name' => ['required', 'string', 'max:255'],
            'division' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
            'upazila' => ['required', 'string', 'max:100'],
            'union' => ['nullable', 'string', 'max:100'],
            'village' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'land_area' => ['nullable', 'numeric', 'min:0'],
            'land_area_unit' => ['nullable', 'string', 'max:50'],
            'soil_type' => ['nullable', 'string', 'max:100'],
            'irrigation_type' => ['nullable', 'string', 'max:100'],
            'farming_method' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE,SUSPENDED'],
            'verification_status' => ['nullable', 'in:PENDING,VERIFIED,REJECTED'],
            'notes' => ['nullable', 'string'],
        ];
    }
}