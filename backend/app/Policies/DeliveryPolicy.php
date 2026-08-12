<?php

namespace App\Policies;

use App\Models\Delivery;
use App\Models\User;

class DeliveryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('delivery.view') || $user->isAdmin();
    }

    public function view(User $user, Delivery $delivery): bool
    {
        if ($user->hasPermission('delivery.view') || $user->isAdmin()) {
            return true;
        }

        // Delivery agent can view their assigned deliveries
        return $user->deliveryAgent?->id === $delivery->delivery_agent_id;
    }

    public function assign(User $user): bool
    {
        return $user->hasPermission('delivery.assign') || $user->isAdmin();
    }

    public function update(User $user, Delivery $delivery): bool
    {
        if ($user->hasPermission('delivery.update') || $user->isAdmin()) {
            return true;
        }

        // Delivery agent can update their own assigned deliveries
        return $user->deliveryAgent?->id === $delivery->delivery_agent_id;
    }
}