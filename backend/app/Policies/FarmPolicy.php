<?php

namespace App\Policies;

use App\Models\Farm;
use App\Models\User;

class FarmPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('farm.view');
    }

    public function view(User $user, Farm $farm): bool
    {
        if ($user->hasPermission('farm.view')) {
            return true;
        }

        // Farmer can view their own farm
        return $user->farmer?->id === $farm->farmer_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('farm.create');
    }

    public function update(User $user, Farm $farm): bool
    {
        if ($user->hasPermission('farm.update')) {
            return true;
        }

        return $user->farmer?->id === $farm->farmer_id;
    }

    public function delete(User $user, Farm $farm): bool
    {
        return $user->hasPermission('farm.delete');
    }
}