<?php

namespace App\Enums;

enum DeliveryStatus: string
{
    case PENDING = 'PENDING';
    case ASSIGNED = 'ASSIGNED';
    case PICKED_UP = 'PICKED_UP';
    case OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY';
    case DELIVERED = 'DELIVERED';
    case FAILED = 'FAILED';
    case CANCELLED = 'CANCELLED';
    case RETURNING = 'RETURNING';
    case RETURNED = 'RETURNED';
}

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

enum FarmerStatus: string
{
    case ACTIVE = 'ACTIVE';
    case INACTIVE = 'INACTIVE';
    case SUSPENDED = 'SUSPENDED';
}

enum VerificationStatus: string
{
    case PENDING = 'PENDING';
    case VERIFIED = 'VERIFIED';
    case REJECTED = 'REJECTED';
}

enum FarmCropStatus: string
{
    case PLANNED = 'PLANNED';
    case GROWING = 'GROWING';
    case READY = 'READY';
    case HARVESTED = 'HARVESTED';
    case CANCELLED = 'CANCELLED';
}

enum WarehouseType: string
{
    case COLLECTION_CENTER = 'COLLECTION_CENTER';
    case WAREHOUSE = 'WAREHOUSE';
    case DHAKA_HUB = 'DHAKA_HUB';
    case DISTRIBUTION_CENTER = 'DISTRIBUTION_CENTER';
}

enum ProductStatus: string
{
    case DRAFT = 'DRAFT';
    case ACTIVE = 'ACTIVE';
    case INACTIVE = 'INACTIVE';
    case DISCONTINUED = 'DISCONTINUED';
}

enum ProductType: string
{
    case FRESH = 'FRESH';
    case PACKAGED = 'PACKAGED';
    case ORGANIC = 'ORGANIC';
    case PROCESSED = 'PROCESSED';
}

enum SourcingStatus: string
{
    case PENDING = 'PENDING';
    case PURCHASED = 'PURCHASED';
    case IN_TRANSIT = 'IN_TRANSIT';
    case RECEIVED = 'RECEIVED';
    case REJECTED = 'REJECTED';
    case CANCELLED = 'CANCELLED';
}

enum QualityCheckStatus: string
{
    case PASSED = 'PASSED';
    case PARTIAL = 'PARTIAL';
    case FAILED = 'FAILED';
}

enum ReviewStatus: string
{
    case PENDING = 'PENDING';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
}

enum PackagingStatus: string
{
    case AVAILABLE = 'AVAILABLE';
    case ASSIGNED = 'ASSIGNED';
    case WITH_CUSTOMER = 'WITH_CUSTOMER';
    case RETURNED = 'RETURNED';
    case DAMAGED = 'DAMAGED';
    case LOST = 'LOST';
}

enum PaymentMethod: string
{
    case COD = 'COD';
    case ONLINE = 'ONLINE';
}

enum AddressType: string
{
    case HOME = 'HOME';
    case OFFICE = 'OFFICE';
    case OTHER = 'OTHER';
}

enum CouponType: string
{
    case FIXED = 'FIXED';
    case PERCENTAGE = 'PERCENTAGE';
}