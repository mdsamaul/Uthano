<?php

namespace App\Services;

use App\Models\PackagingItem;
use App\Models\PackagingMovement;
use Illuminate\Database\Eloquent\Model;

class PackagingItemService
{
    public function createPackagingItem(array $data): PackagingItem
    {
        return PackagingItem::create($data);
    }

    public function updatePackagingItem(PackagingItem $packagingItem, array $data): PackagingItem
    {
        $packagingItem->update($data);

        return $packagingItem->fresh();
    }

    public function getMovements(PackagingItem $packagingItem)
    {
        return $packagingItem->movements()->orderByDesc('created_at')->get();
    }
}