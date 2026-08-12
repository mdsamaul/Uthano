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
        $productId = $this->route('product')?->id;

        return [
            'category_id' => ['required', 'exists:categories,id'],
            'unit_id' => ['required', 'exists:units,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug,' . $productId],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku,' . $productId],
            'product_type' => ['required', 'in:FRESH,PACKAGED,ORGANIC,PROCESSED'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'minimum_order_quantity' => ['nullable', 'numeric', 'min:0.01'],
            'maximum_order_quantity' => ['nullable', 'numeric', 'gt:minimum_order_quantity'],
            'stock_tracking' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'status' => ['required', 'in:DRAFT,ACTIVE,INACTIVE,DISCONTINUED'],
        ];
    }
}