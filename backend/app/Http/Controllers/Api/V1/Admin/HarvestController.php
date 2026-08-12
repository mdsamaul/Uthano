<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HarvestRequest;
use App\Http\Resources\HarvestResource;
use App\Models\Harvest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HarvestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Harvest::query()->with(['farm.farmer', 'product', 'quantityUnit', 'batches']);

        if ($request->has('farm_id') && $request->farm_id) {
            $query->where('farm_id', $request->farm_id);
        }

        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('from') && $request->from) {
            $query->where('harvest_date', '>=', $request->from);
        }

        if ($request->has('to') && $request->to) {
            $query->where('harvest_date', '<=', $request->to);
        }

        $harvests = $query->orderByDesc('harvest_date')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Harvests fetched successfully',
            HarvestResource::collection($harvests),
            [
                'current_page' => $harvests->currentPage(),
                'per_page' => $harvests->perPage(),
                'total' => $harvests->total(),
                'last_page' => $harvests->lastPage(),
            ]
        );
    }

    public function store(HarvestRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['harvest_code'] = $this->generateHarvestCode();

        $harvest = Harvest::create($data);

        return ApiResponse::created('Harvest created successfully', new HarvestResource($harvest->load(['farm.farmer', 'product', 'quantityUnit'])));
    }

    public function show(int $id): JsonResponse
    {
        $harvest = Harvest::with(['farm.farmer', 'farmCrop', 'product', 'quantityUnit', 'batches.inventoryItems.warehouse'])->findOrFail($id);

        return ApiResponse::success('Harvest fetched successfully', new HarvestResource($harvest));
    }

    public function update(HarvestRequest $request, int $id): JsonResponse
    {
        $harvest = Harvest::findOrFail($id);
        $harvest->update($request->validated());

        return ApiResponse::success('Harvest updated successfully', new HarvestResource($harvest->load(['farm.farmer', 'product', 'quantityUnit'])));
    }

    public function destroy(int $id): JsonResponse
    {
        $harvest = Harvest::findOrFail($id);
        $harvest->delete();

        return ApiResponse::noContent();
    }

    private function generateHarvestCode(): string
    {
        return 'HARV-' . date('Y') . '-' . str_pad((string) (Harvest::count() + 1), 4, '0', STR_PAD_LEFT);
    }
}