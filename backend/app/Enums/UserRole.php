<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'ADMIN';
    case CUSTOMER = 'CUSTOMER';
    case FARMER = 'FARMER';
    case WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER';
    case DELIVERY_AGENT = 'DELIVERY_AGENT';
    case STAFF = 'STAFF';
}