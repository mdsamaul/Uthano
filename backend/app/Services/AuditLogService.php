<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditLogService
{
    public function deleteOldLogs(int $days): int
    {
        return AuditLog::where('created_at', '<', now()->subDays($days))->delete();
    }
}