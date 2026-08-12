<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FarmResource;
use App\Http\Resources\HarvestResource;
use App\Models\Farm;
use App\Models\Harvest;
use App\Models\SourcingRecord;
use App\Services\FarmerAnalyticsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmerPortalController extends Controller
{
    public function __construct(private readonly FarmerAnalyticsService $analyticsService) {}

    public function dashboard(Request $request): JsonResponse
    {
        $farmer = $request->user()->farmer()->firstOrFail();

        $analytics = $this->analyticsService->getFarmerAnalytics($farmer->id);

        return ApiResponse::success('Farmer dashboard fetched successfully', $analytics);
    }

    public function farms(Request $request): JsonResponse
    {
        $farmer = $request->user()->farmer()->firstOrFail();

        $farms = Farm::where('farmer_id', $farmer->id)
            ->with('crops.product')
            ->orderByDesc('created_at')
            ->get();

        return ApiResponse::success('Farmer farms fetched successfully', FarmResource::collection($farms));
    }

    public function harvests(Request $request): JsonResponse
    {
        $farmer = $request->user()->farmer()->firstOrFail();

        $farmIds = $farmer->farms()->pluck('id');

        $harvests = Harvest::whereIn('farm_id', $farmIds)
            ->with(['farm', 'product', 'quantityUnit', 'batches'])
            ->orderByDesc('harvest_date')
            ->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Farmer harvests fetched successfully',
            HarvestResource::collection($harvests),
            [
                'current_page' => $harvests->currentPage(),
                'per_page' => $harvests->perPage(),
                'total' => $harvests->total(),
                'last_page' => $harvests->lastPage(),
            ]
        );
    }

    public function sourcingRecords(Request $request): JsonResponse
    {
        $farmer = $request->user()->farmer()->firstOrFail();

        $records = SourcingRecord::where('farmer_id', $farmer->id)
            ->with(['farm', 'harvestBatch', 'product', 'unit', 'warehouse'])
            ->orderByDesc('sourced_at')
            ->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Farmer sourcing records fetched successfully',
            $records,
            [
                'current_page' => $records->currentPage(),
                'per_page' => $records->perPage(),
                'total' => $records->total(),
                'last_page' => $records->lastPage(),
            ]
        );
    }

    public function earnings(Request $request): JsonResponse
    {
        $farmer = $request->user()->farmer()->firstOrFail();

        $records = SourcingRecord::where('farmer_id', $farmer->id)
            ->where('status', 'RECEIVED')
            ->get();

        $totalEarnings = $records->sum('total_procurement_cost');
        $totalQuantity = $records->sum('quantity');

        return ApiResponse::success('Farmer earnings fetched successfully', [
            'total_earnings' => (float) $totalEarnings,
            'total_quantity' => (float) $totalQuantity,
            'records_count' => $records->count(),
            'records' => $records->map(fn ($record) => [
                'sourcing_code' => $record->sourcing_code,
                'product' => $record->product?->name,
                'quantity' => (float) $record->quantity,
                'total_procurement_cost' => (float) $record->total_procurement_cost,
                'sourced_at' => $record->sourced_at?->toISOString(),
            ]),
        ]);
    }
}