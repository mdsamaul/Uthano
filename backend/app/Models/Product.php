<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'unit_id',
        'name',
        'slug',
        'description',
        'short_description',
        'sku',
        'product_type',
        'base_price',
        'selling_price',
        'cost_price',
        'minimum_order_quantity',
        'maximum_order_quantity',
        'stock_tracking',
        'is_featured',
        'is_active',
        'status',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'minimum_order_quantity' => 'decimal:2',
        'maximum_order_quantity' => 'decimal:2',
        'stock_tracking' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'product_type' => 'string',
        'status' => 'string',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }
}