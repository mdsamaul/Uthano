<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'PENDING';
    case CONFIRMED = 'CONFIRMED';
    case PROCESSING = 'PROCESSING';
    case PACKED = 'PACKED';
    case READY_FOR_DELIVERY = 'READY_FOR_DELIVERY';
    case OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY';
    case DELIVERED = 'DELIVERED';
    case CANCELLED = 'CANCELLED';
    case RETURN_REQUESTED = 'RETURN_REQUESTED';
    case RETURNED = 'RETURNED';
    case REFUNDED = 'REFUNDED';
}