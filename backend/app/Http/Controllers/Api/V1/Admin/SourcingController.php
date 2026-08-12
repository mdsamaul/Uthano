<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SourcingRequest;
use App\Http\Resources\SourcingResource;
use App\Models\SourcingRecord;
use App\Services\SourcingService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SourcingController extends Controller
{
    public function __construct(private readonly SourcingService $sourcingService) {}

    public function index(Request $request): JsonResponse
    {
        $query = SourcingRecord::query()->with(['farmer', 'farm', 'harvestBatch', 'product', 'unit', 'warehouse']);

        if ($request->has('farmer_id') && $request->farmer_id) {
            $query->where('farmer_id', $request->farmer_id);
        }

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
            $query->where('sourced_at', '>=', $request->from);
        }

        if ($request->has('to') && $request->to) {
            $query->where('sourced_at', '<=', $request->to);
        }

        $records = $query->orderByDesc('sourced_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Sourcing records fetched successfully',
            SourcingResource::collection($records),
            [
                'current_page' => $records->currentPage(),
                'per_page' => $records->perPage(),
                'total' => $records->total(),
                'last_page' => $records->lastPage(),
            ]
        );
    }

    public function store(SourcingRequest $request): JsonResponse
    {
        $record = $this->sourcingService->createSourcingRecord($request->validated());

        return ApiResponse::created('Sourcing record created successfully', new SourcingResource($record->load(['farmer', 'farm', 'harvestBatch', 'product', 'unit', 'warehouse'])));
    }

    public function show(int $id): JsonResponse
    {
        $record = SourcingRecord::with(['farmer', 'farm', 'harvestBatch', 'product', 'unit', 'warehouse'])->findOrFail($id);

        return ApiResponse::success('Sourcing record fetched successfully', new SourcingResource($record));
    }

    public function receive(int $id): JsonResponse
    {
        $record = $this->sourcingService->receiveSourcingRecord($id);

        return ApiResponse::success('Sourcing record received successfully', new SourcingResource($record->load(['farmer', 'farm', 'harvestBatch', 'product', 'unit', 'warehouse'])));
    }

    public function destroy(int $id): JsonResponse
    {
        $record = SourcingRecord::findOrFail($id);
        $record->delete();

        return ApiResponse::noContent();
    }
}