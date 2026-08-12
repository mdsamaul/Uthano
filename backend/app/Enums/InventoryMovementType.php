<?php

namespace App\Enums;

enum InventoryMovementType: string
{
    case IN = 'IN';
    case OUT = 'OUT';
    case RESERVED = 'RESERVED';
    case RELEASED = 'RELEASED';
    case ADJUSTMENT = 'ADJUSTMENT';
    case DAMAGED = 'DAMAGED';
    case EXPIRED = 'EXPIRED';
    case RETURNED = 'RETURNED';
    case TRANSFER_IN = 'TRANSFER_IN';
    case TRANSFER_OUT = 'TRANSFER_OUT';
}