<?php

namespace App\Policies;

use App\Models\User;

class InventoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('inventory.view') || $user->isAdmin();
    }

    public function view(User $user): bool
    {
        return $user->hasPermission('inventory.view') || $user->isAdmin();
    }

    public function adjust(User $user): bool
    {
        return $user->hasPermission('inventory.adjust') || $user->isAdmin();
    }

    public function transfer(User $user): bool
    {
        return $user->hasPermission('inventory.adjust') || $user->isAdmin();
    }
}