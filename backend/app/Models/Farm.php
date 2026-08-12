<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Farm extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'farm_code',
        'farm_name',
        'division',
        'district',
        'upazila',
        'union',
        'village',
        'address',
        'latitude',
        'longitude',
        'land_area',
        'land_area_unit',
        'soil_type',
        'irrigation_type',
        'farming_method',
        'status',
        'verification_status',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'land_area' => 'decimal:2',
        'status' => 'string',
        'verification_status' => 'string',
    ];

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }

    public function crops(): HasMany
    {
        return $this->hasMany(FarmCrop::class);
    }

    public function harvests(): HasMany
    {
        return $this->hasMany(Harvest::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(FarmDocument::class);
    }
}