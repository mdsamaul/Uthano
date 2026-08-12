<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SourcingRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'sourcing_code',
        'farmer_id',
        'farm_id',
        'harvest_batch_id',
        'product_id',
        'quantity',
        'unit_id',
        'purchase_price',
        'total_cost',
        'transport_cost',
        'packaging_cost',
        'other_cost',
        'total_procurement_cost',
        'sourced_at',
        'received_at',
        'warehouse_id',
        'status',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'transport_cost' => 'decimal:2',
        'packaging_cost' => 'decimal:2',
        'other_cost' => 'decimal:2',
        'total_procurement_cost' => 'decimal:2',
        'sourced_at' => 'datetime',
        'received_at' => 'datetime',
        'status' => 'string',
    ];

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function harvestBatch(): BelongsTo
    {
        return $this->belongsTo(HarvestBatch::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }
}