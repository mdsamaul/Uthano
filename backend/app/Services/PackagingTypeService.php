<?php

namespace App\Services;

use App\Models\PackagingType;
use Illuminate\Database\Eloquent\Model;

class PackagingTypeService
{
    public function createPackagingType(array $data): PackagingType
    {
        return PackagingType::create($data);
    }

    public function updatePackagingType(PackagingType $packagingType, array $data): PackagingType
    {
        $packagingType->update($data);

        return $packagingType->fresh();
    }

    public function togglePackagingType(PackagingType $packagingType): PackagingType
    {
        $packagingType->update([
            'is_active' => !$packagingType->is_active,
        ]);

        return $packagingType->fresh();
    }
}