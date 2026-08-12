<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\WarehouseRequest;
use App\Http\Resources\WarehouseResource;
use App\Models\Warehouse;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Warehouse::query()->with('manager')->withCount('inventoryItems');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('warehouse_code', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%");
            });
        }

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('district') && $request->district) {
            $query->where('district', $request->district);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $warehouses = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Warehouses fetched successfully',
            WarehouseResource::collection($warehouses),
            [
                'current_page' => $warehouses->currentPage(),
                'per_page' => $warehouses->perPage(),
                'total' => $warehouses->total(),
                'last_page' => $warehouses->lastPage(),
            ]
        );
    }

    public function store(WarehouseRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['warehouse_code'] = $this->generateWarehouseCode();

        $warehouse = Warehouse::create($data);

        return ApiResponse::created('Warehouse created successfully', new WarehouseResource($warehouse->load('manager')));
    }

    public function show(int $id): JsonResponse
    {
        $warehouse = Warehouse::with(['manager', 'locations', 'inventoryItems.product', 'inventoryItems.harvestBatch'])->findOrFail($id);

        return ApiResponse::success('Warehouse fetched successfully', new WarehouseResource($warehouse));
    }

    public function update(WarehouseRequest $request, int $id): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($id);
        $warehouse->update($request->validated());

        return ApiResponse::success('Warehouse updated successfully', new WarehouseResource($warehouse->load('manager')));
    }

    public function destroy(int $id): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($id);
        $warehouse->delete();

        return ApiResponse::noContent();
    }

    private function generateWarehouseCode(): string
    {
        return 'WH-' . strtoupper(uniqid());
    }
}