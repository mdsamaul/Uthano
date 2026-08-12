<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:COLLECTION_CENTER,WAREHOUSE,DHAKA_HUB,DISTRIBUTION_CENTER'],
            'address' => ['required', 'string', 'max:500'],
            'district' => ['required', 'string', 'max:100'],
            'area' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'manager_id' => ['nullable', 'exists:users,id'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE,SUSPENDED'],
        ];
    }
}