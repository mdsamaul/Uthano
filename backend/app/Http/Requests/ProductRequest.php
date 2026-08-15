<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('id');
        // For PUT/PATCH (update) fields are optional so partial payloads work.
        $req = $this->isMethod('PUT') || $this->isMethod('PATCH') ? 'sometimes' : 'required';

        return [
            'category_id' => [$req, 'exists:categories,id'],
            'unit_id' => [$req, 'exists:units,id'],
            'name' => [$req, 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug,' . $productId],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'sku' => [$req, 'string', 'max:100', 'unique:products,sku,' . $productId],
            'product_type' => [$req, 'in:FRESH,PACKAGED,ORGANIC,PROCESSED'],
            'base_price' => [$req, 'numeric', 'min:0'],
            'selling_price' => [$req, 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'minimum_order_quantity' => ['nullable', 'numeric', 'min:0.01'],
            'maximum_order_quantity' => ['nullable', 'numeric', 'gt:minimum_order_quantity'],
            'stock_tracking' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'status' => [$req, 'in:DRAFT,ACTIVE,INACTIVE,DISCONTINUED'],
            // Product images (multipart/form-data only)
            'images' => ['sometimes', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ];
    }
}