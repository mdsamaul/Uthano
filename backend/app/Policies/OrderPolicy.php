<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('order.view');
    }

    public function view(User $user, Order $order): bool
    {
        if ($user->hasPermission('order.view')) {
            return true;
        }

        // Customer can view their own orders
        return $user->customerProfile?->id === $order->customer_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->hasPermission('order.update');
    }

    public function cancel(User $user, Order $order): bool
    {
        if ($user->hasPermission('order.cancel')) {
            return true;
        }

        // Customer can cancel their own pending order
        return $user->customerProfile?->id === $order->customer_id
            && in_array($order->order_status, ['PENDING', 'CONFIRMED']);
    }
}