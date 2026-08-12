<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeliveryZoneRequest;
use App\Http\Resources\DeliveryZoneResource;
use App\Models\DeliveryZone;
use App\Services\DeliveryZoneService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryZoneController extends Controller
{
    public function __construct(private readonly DeliveryZoneService $deliveryZoneService) {}

    public function index(Request $request): JsonResponse
    {
        $query = DeliveryZone::query();

        // Filters
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('district') && $request->district) {
            $query->where('district', 'like', "%{$request->district}%");
        }
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere('area', 'like', "%{$search}%");
            });
        }

        $zones = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Delivery zones fetched successfully',
            DeliveryZoneResource::collection($zones),
            [
                'current_page' => $zones->currentPage(),
                'per_page' => $zones->perPage(),
                'total' => $zones->total(),
                'last_page' => $zones->lastPage(),
            ]
        );
    }

    public function show(int $id): JsonResponse
    {
        $zone = DeliveryZone::withCount('deliveries')->findOrFail($id);

        return ApiResponse::success('Delivery zone fetched successfully', new DeliveryZoneResource($zone));
    }

    public function store(DeliveryZoneRequest $request): JsonResponse
    {
        $zone = $this->deliveryZoneService->createZone($request->validated());

        return ApiResponse::created('Delivery zone created successfully', new DeliveryZoneResource($zone->loadCount('deliveries')));
    }

    public function update(DeliveryZoneRequest $request, int $id): JsonResponse
    {
        $zone = DeliveryZone::findOrFail($id);
        $zone = $this->deliveryZoneService->updateZone($zone, $request->validated());

        return ApiResponse::success('Delivery zone updated successfully', new DeliveryZoneResource($zone->loadCount('deliveries')));
    }

    public function destroy(int $id): JsonResponse
    {
        $zone = DeliveryZone::findOrFail($id);
        $zone->delete();

        return ApiResponse::noContent();
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $zone = DeliveryZone::findOrFail($id);
        $zone = $this->deliveryZoneService->toggleZoneStatus($zone);

        return ApiResponse::success('Delivery zone status updated successfully', new DeliveryZoneResource($zone->loadCount('deliveries')));
    }
}