<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'delivery_code',
        'delivery_agent_id',
        'delivery_zone_id',
        'pickup_warehouse_id',
        'assigned_at',
        'picked_up_at',
        'out_for_delivery_at',
        'delivered_at',
        'failed_at',
        'status',
        'delivery_fee',
        'customer_note',
        'proof_of_delivery',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'out_for_delivery_at' => 'datetime',
        'delivered_at' => 'datetime',
        'failed_at' => 'datetime',
        'delivery_fee' => 'decimal:2',
        'status' => 'string',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function deliveryAgent(): BelongsTo
    {
        return $this->belongsTo(DeliveryAgent::class);
    }

    public function deliveryZone(): BelongsTo
    {
        return $this->belongsTo(DeliveryZone::class);
    }

    public function pickupWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'pickup_warehouse_id');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(DeliveryStatusHistory::class);
    }
}