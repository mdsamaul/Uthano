<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QualityCheck extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'harvest_batch_id',
        'warehouse_id',
        'checked_by',
        'checked_at',
        'appearance',
        'freshness',
        'damaged_quantity',
        'accepted_quantity',
        'rejected_quantity',
        'grade',
        'status',
        'notes',
    ];

    protected $casts = [
        'checked_at' => 'datetime',
        'damaged_quantity' => 'decimal:2',
        'accepted_quantity' => 'decimal:2',
        'rejected_quantity' => 'decimal:2',
        'status' => 'string',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function harvestBatch(): BelongsTo
    {
        return $this->belongsTo(HarvestBatch::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function checkedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_by');
    }
}