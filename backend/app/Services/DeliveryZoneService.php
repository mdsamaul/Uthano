<?php

namespace App\Services;

use App\Models\DeliveryZone;
use Illuminate\Database\Eloquent\Model;

class DeliveryZoneService
{
    public function createZone(array $data): DeliveryZone
    {
        return DeliveryZone::create($data);
    }

    public function updateZone(DeliveryZone $zone, array $data): DeliveryZone
    {
        $zone->update($data);

        return $zone->fresh();
    }

    public function toggleZoneStatus(DeliveryZone $zone): DeliveryZone
    {
        $zone->update([
            'status' => $zone->status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        ]);

        return $zone->fresh();
    }
}