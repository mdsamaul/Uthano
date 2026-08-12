<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeliveryAgentRequest extends FormRequest
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
            'user_id' => ['required', 'exists:users,id'],
            'agent_code' => ['required', 'string', 'max:50', 'unique:delivery_agents,agent_code,' . $this->route('id')],
            'phone' => ['required', 'string', 'max:20'],
            'vehicle_type' => ['required', 'string', 'max:50'],
            'vehicle_number' => ['required', 'string', 'max:50'],
            'status' => ['nullable', Rule::in(['ACTIVE', 'INACTIVE', 'ON_DELIVERY'])],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'User is required',
            'agent_code.required' => 'Agent code is required',
            'agent_code.unique' => 'Agent code already exists',
            'phone.required' => 'Phone number is required',
            'vehicle_type.required' => 'Vehicle type is required',
            'vehicle_number.required' => 'Vehicle number is required',
        ];
    }
}