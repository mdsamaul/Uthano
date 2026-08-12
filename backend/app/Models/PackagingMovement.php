<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackagingMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'packaging_item_id',
        'movement_type',
        'from_warehouse_id',
        'to_warehouse_id',
        'order_id',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'movement_type' => 'string',
    ];

    public function packagingItem(): BelongsTo
    {
        return $this->belongsTo(PackagingItem::class);
    }

    public function fromWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}