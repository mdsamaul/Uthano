<?php

namespace App\Policies;

use App\Models\Farm;
use App\Models\User;

class FarmPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('farm.view') || $user->isAdmin();
    }

    public function view(User $user, Farm $farm): bool
    {
        if ($user->hasPermission('farm.view') || $user->isAdmin()) {
            return true;
        }

        // Farmer can view their own farm
        return $user->farmer?->id === $farm->farmer_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('farm.create') || $user->isAdmin();
    }

    public function update(User $user, Farm $farm): bool
    {
        if ($user->hasPermission('farm.update') || $user->isAdmin()) {
            return true;
        }

        return $user->farmer?->id === $farm->farmer_id;
    }

    public function delete(User $user, Farm $farm): bool
    {
        return $user->hasPermission('farm.delete') || $user->isAdmin();
    }
}