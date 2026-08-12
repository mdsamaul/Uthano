<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'minimum_order_amount',
        'maximum_discount',
        'start_at',
        'end_at',
        'usage_limit',
        'per_customer_limit',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'usage_limit' => 'integer',
        'per_customer_limit' => 'integer',
        'is_active' => 'boolean',
        'type' => 'string',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->start_at && now()->lt($this->start_at)) {
            return false;
        }

        if ($this->end_at && now()->gt($this->end_at)) {
            return false;
        }

        if ($this->usage_limit && $this->usages()->count() >= $this->usage_limit) {
            return false;
        }

        return true;
    }
}