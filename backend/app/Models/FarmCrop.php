<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FarmCrop extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'product_id',
        'planting_date',
        'expected_harvest_date',
        'actual_harvest_date',
        'cultivation_area',
        'cultivation_area_unit',
        'cultivation_method',
        'status',
    ];

    protected $casts = [
        'planting_date' => 'date',
        'expected_harvest_date' => 'date',
        'actual_harvest_date' => 'date',
        'cultivation_area' => 'decimal:2',
        'status' => 'string',
    ];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function harvests(): HasMany
    {
        return $this->hasMany(Harvest::class);
    }
}