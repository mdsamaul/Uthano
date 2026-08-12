<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Model;

class NotificationService
{
    public function markAsRead(Notification $notification): Notification
    {
        $notification->update(['read_at' => now()]);

        return $notification->fresh();
    }

    public function markAllAsRead(int $userId): void
    {
        Notification::where('user_id', $userId)->whereNull('read_at')->update(['read_at' => now()]);
    }

    public function createNotification(array $data): Notification
    {
        return Notification::create($data);
    }
}