<?php

namespace App\Policies;

use App\Models\Farmer;
use App\Models\User;

class FarmerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('farmer.view') || $user->isAdmin();
    }

    public function view(User $user, Farmer $farmer): bool
    {
        if ($user->hasPermission('farmer.view') || $user->isAdmin()) {
            return true;
        }

        // Farmer can view their own profile
        return $user->farmer?->id === $farmer->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('farmer.create') || $user->isAdmin();
    }

    public function update(User $user, Farmer $farmer): bool
    {
        if ($user->hasPermission('farmer.update') || $user->isAdmin()) {
            return true;
        }

        // Farmer can update their own profile
        return $user->farmer?->id === $farmer->id;
    }

    public function delete(User $user, Farmer $farmer): bool
    {
        return $user->hasPermission('farmer.delete') || $user->isAdmin();
    }
}