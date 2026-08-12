<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\QualityCheckRequest;
use App\Http\Resources\QualityCheckResource;
use App\Models\QualityCheck;
use App\Services\QualityCheckService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QualityCheckController extends Controller
{
    public function __construct(private readonly QualityCheckService $qualityCheckService) {}

    public function index(Request $request): JsonResponse
    {
        $query = QualityCheck::query()
            ->with(['product', 'harvestBatch', 'warehouse', 'checkedBy']);

        // Filters
        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->has('warehouse_id') && $request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('grade') && $request->grade) {
            $query->where('grade', $request->grade);
        }
        if ($request->has('from') && $request->from) {
            $query->where('checked_at', '>=', $request->from);
        }
        if ($request->has('to') && $request->to) {
            $query->where('checked_at', '<=', $request->to);
        }

        $qualityChecks = $query->orderByDesc('checked_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Quality checks fetched successfully',
            QualityCheckResource::collection($qualityChecks),
            [
                'current_page' => $qualityChecks->currentPage(),
                'per_page' => $qualityChecks->perPage(),
                'total' => $qualityChecks->total(),
                'last_page' => $qualityChecks->lastPage(),
            ]
        );
    }

    public function show(int $id): JsonResponse
    {
        $qualityCheck = QualityCheck::with(['product', 'harvestBatch', 'warehouse', 'checkedBy'])->findOrFail($id);

        return ApiResponse::success('Quality check fetched successfully', new QualityCheckResource($qualityCheck));
    }

    public function store(QualityCheckRequest $request): JsonResponse
    {
        $qualityCheck = $this->qualityCheckService->createQualityCheck(
            $request->validated(),
            $request->user()->id
        );

        return ApiResponse::created('Quality check created successfully', new QualityCheckResource($qualityCheck->load(['product', 'harvestBatch', 'warehouse', 'checkedBy'])));
    }

    public function update(QualityCheckRequest $request, int $id): JsonResponse
    {
        $qualityCheck = QualityCheck::findOrFail($id);
        $qualityCheck = $this->qualityCheckService->updateQualityCheck($qualityCheck, $request->validated());

        return ApiResponse::success('Quality check updated successfully', new QualityCheckResource($qualityCheck->load(['product', 'harvestBatch', 'warehouse', 'checkedBy'])));
    }

    public function destroy(int $id): JsonResponse
    {
        $qualityCheck = QualityCheck::findOrFail($id);
        $qualityCheck->delete();

        return ApiResponse::noContent();
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $qualityCheck = QualityCheck::findOrFail($id);
        $qualityCheck = $this->qualityCheckService->approveQualityCheck($qualityCheck, $request->user()->id);

        return ApiResponse::success('Quality check approved successfully', new QualityCheckResource($qualityCheck->load(['product', 'harvestBatch', 'warehouse', 'checkedBy'])));
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $qualityCheck = QualityCheck::findOrFail($id);
        $qualityCheck = $this->qualityCheckService->rejectQualityCheck($qualityCheck, $validated['reason'], $request->user()->id);

        return ApiResponse::success('Quality check rejected successfully', new QualityCheckResource($qualityCheck->load(['product', 'harvestBatch', 'warehouse', 'checkedBy'])));
    }
}