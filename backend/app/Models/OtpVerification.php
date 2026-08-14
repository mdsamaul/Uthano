<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    protected $fillable = [
        'phone',
        'purpose',
        'otp_code',
        'attempts',
        'expires_at',
        'verified_at',
        'resent_at',
    ];

    protected $casts = [
        'attempts' => 'integer',
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'resent_at' => 'datetime',
    ];

    public const MAX_ATTEMPTS = 5;

    public const TTL_MINUTES = 10;

    public const RESEND_WAIT_SECONDS = 60;

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function isLocked(): bool
    {
        return $this->attempts >= self::MAX_ATTEMPTS;
    }
}
