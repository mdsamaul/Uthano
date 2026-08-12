<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Harvest extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'farm_crop_id',
        'product_id',
        'harvest_code',
        'harvest_date',
        'estimated_quantity',
        'actual_quantity',
        'quantity_unit_id',
        'quality_grade',
        'status',
        'notes',
    ];

    protected $casts = [
        'harvest_date' => 'date',
        'estimated_quantity' => 'decimal:2',
        'actual_quantity' => 'decimal:2',
        'status' => 'string',
    ];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function farmCrop(): BelongsTo
    {
        return $this->belongsTo(FarmCrop::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function quantityUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'quantity_unit_id');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(HarvestBatch::class);
    }
}