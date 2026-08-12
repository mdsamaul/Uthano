<?php

namespace App\Services;

use App\Models\Farmer;
use App\Models\Harvest;
use App\Models\SourcingRecord;

class FarmerAnalyticsService
{
    public function getFarmerAnalytics(int $farmerId): array
    {
        $farmer = Farmer::with(['farms', 'sourcingRecords.product'])->findOrFail($farmerId);

        $suppliedQuantity = $farmer->sourcingRecords->sum('quantity');
        $acceptedQuantity = $farmer->sourcingRecords
            ->where('status', 'RECEIVED')
            ->sum('quantity');
        $totalProcurementValue = $farmer->sourcingRecords
            ->where('status', 'RECEIVED')
            ->sum('total_procurement_cost');

        $harvestedQuantity = Harvest::whereIn('farm_id', $farmer->farms->pluck('id'))->sum('actual_quantity');

        return [
            'farmer' => [
                'id' => $farmer->id,
                'farmer_code' => $farmer->farmer_code,
                'full_name' => $farmer->full_name,
            ],
            'total_farms' => $farmer->farms->count(),
            'total_harvested' => $harvestedQuantity,
            'total_supplied' => $suppliedQuantity,
            'total_accepted' => $acceptedQuantity,
            'rejected' => max(0, $suppliedQuantity - $acceptedQuantity),
            'total_procurement_value' => $totalProcurementValue,
            'products' => $farmer->sourcingRecords
                ->pluck('product.name')
                ->unique()
                ->values(),
            'farm_wise' => $farmer->farms->map(fn ($farm) => [
                'farm_id' => $farm->id,
                'farm_code' => $farm->farm_code,
                'farm_name' => $farm->farm_name,
                'district' => $farm->district,
                'upazila' => $farm->upazila,
                'total_harvested' => Harvest::where('farm_id', $farm->id)->sum('actual_quantity'),
                'total_sourcing_records' => SourcingRecord::where('farm_id', $farm->id)->count(),
                'total_procurement_value' => SourcingRecord::where('farm_id', $farm->id)
                    ->where('status', 'RECEIVED')
                    ->sum('total_procurement_cost'),
            ]),
        ];
    }
}