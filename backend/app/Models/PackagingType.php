<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PackagingType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'capacity',
        'capacity_unit',
        'is_reusable',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'decimal:2',
        'is_reusable' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function packagingItems(): HasMany
    {
        return $this->hasMany(PackagingItem::class);
    }
}