<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HarvestBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'harvest_id',
        'batch_code',
        'product_id',
        'quantity',
        'remaining_quantity',
        'unit_id',
        'quality_grade',
        'harvested_at',
        'expiry_date',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'remaining_quantity' => 'decimal:2',
        'harvested_at' => 'datetime',
        'expiry_date' => 'date',
        'status' => 'string',
    ];

    public function harvest(): BelongsTo
    {
        return $this->belongsTo(Harvest::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function sourcingRecords(): HasMany
    {
        return $this->hasMany(SourcingRecord::class);
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function qualityChecks(): HasMany
    {
        return $this->hasMany(QualityCheck::class);
    }
}