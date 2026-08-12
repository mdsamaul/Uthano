<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Farmer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'farmer_code',
        'full_name',
        'phone',
        'alternate_phone',
        'national_id',
        'photo',
        'status',
        'verification_status',
        'notes',
    ];

    protected $casts = [
        'status' => 'string',
        'verification_status' => 'string',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function farms(): HasMany
    {
        return $this->hasMany(Farm::class);
    }

    public function sourcingRecords(): HasMany
    {
        return $this->hasMany(SourcingRecord::class);
    }
}