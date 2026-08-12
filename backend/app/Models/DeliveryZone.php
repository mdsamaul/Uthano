<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'district',
        'area',
        'base_charge',
        'weight_based_charge',
        'status',
    ];

    protected $casts = [
        'base_charge' => 'decimal:2',
        'weight_based_charge' => 'decimal:2',
        'status' => 'string',
    ];

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class);
    }
}