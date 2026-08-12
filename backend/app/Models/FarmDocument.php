<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FarmDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'document_type',
        'document_path',
        'document_name',
        'status',
        'notes',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }
}