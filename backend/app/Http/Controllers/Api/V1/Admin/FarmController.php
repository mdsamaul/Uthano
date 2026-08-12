<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FarmRequest;
use App\Http\Resources\FarmResource;
use App\Models\Farm;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Farm::class);

        $query = Farm::query()->with('farmer')->withCount(['crops', 'harvests']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('farm_name', 'like', "%{$search}%")
                    ->orWhere('farm_code', 'like', "%{$search}%")
                    ->orWhere('village', 'like', "%{$search}%");
            });
        }

        if ($request->has('farmer_id') && $request->farmer_id) {
            $query->where('farmer_id', $request->farmer_id);
        }

        if ($request->has('district') && $request->district) {
            $query->where('district', $request->district);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $farms = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Farms fetched successfully',
            FarmResource::collection($farms),
            [
                'current_page' => $farms->currentPage(),
                'per_page' => $farms->perPage(),
                'total' => $farms->total(),
                'last_page' => $farms->lastPage(),
            ]
        );
    }

    public function store(FarmRequest $request): JsonResponse
    {
        $this->authorize('create', Farm::class);

        $data = $request->validated();
        $data['farm_code'] = $this->generateFarmCode();

        $farm = Farm::create($data);

        return ApiResponse::created('Farm created successfully', new FarmResource($farm->load('farmer')));
    }

    public function show(int $id): JsonResponse
    {
        $farm = Farm::with(['farmer', 'crops.product', 'harvests.batches', 'documents'])->findOrFail($id);

        $this->authorize('view', $farm);

        return ApiResponse::success('Farm fetched successfully', new FarmResource($farm));
    }

    public function update(FarmRequest $request, int $id): JsonResponse
    {
        $farm = Farm::findOrFail($id);
        $this->authorize('update', $farm);

        $farm->update($request->validated());

        return ApiResponse::success('Farm updated successfully', new FarmResource($farm->load('farmer')));
    }

    public function destroy(int $id): JsonResponse
    {
        $farm = Farm::findOrFail($id);
        $this->authorize('delete', $farm);

        $farm->delete();

        return ApiResponse::noContent();
    }

    private function generateFarmCode(): string
    {
        return 'FARM-' . strtoupper(uniqid());
    }
}