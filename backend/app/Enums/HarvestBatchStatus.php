<?php

namespace App\Enums;

enum HarvestBatchStatus: string
{
    case CREATED = 'CREATED';
    case COLLECTED = 'COLLECTED';
    case IN_TRANSIT = 'IN_TRANSIT';
    case RECEIVED = 'RECEIVED';
    case AVAILABLE = 'AVAILABLE';
    case PARTIALLY_SOLD = 'PARTIALLY_SOLD';
    case SOLD_OUT = 'SOLD_OUT';
    case REJECTED = 'REJECTED';
    case EXPIRED = 'EXPIRED';
}