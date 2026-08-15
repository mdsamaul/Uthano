<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HarvestBatchRequest;
use App\Models\HarvestBatch;
use App\Models\Harvest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HarvestBatch::query()
            ->with(['harvest.farm.farmer', 'product', 'unit', 'inventoryItems.warehouse']);

        if ($request->has('harvest_id') && $request->harvest_id) {
            $query->where('harvest_id', $request->harvest_id);
        }

        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('batch_code', 'like', "%{$search}%");
        }

        $batches = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        // Map batches for frontend table
        $mapped = $batches->getCollection()->map(function ($batch) {
            return [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'harvest_id' => $batch->harvest_id,
                'harvest_name' => $batch->harvest?->harvest_code ?? 'N/A',
                'product_id' => $batch->product_id,
                'product_name' => $batch->product?->name,
                'quantity' => (float) $batch->quantity,
                'remaining_quantity' => (float) $batch->remaining_quantity,
                'unit' => $batch->unit?->symbol ?? 'kg',
                'quality_grade' => $batch->quality_grade,
                'harvested_at' => $batch->harvested_at?->toISOString(),
                'expiry_date' => $batch->expiry_date?->toDateString(),
                'status' => $batch->status,
                'created_at' => $batch->created_at?->toISOString(),
                'updated_at' => $batch->updated_at?->toISOString(),
            ];
        });

        $batches->setCollection($mapped);

                return ApiResponse::paginated(
            'Batches fetched successfully',
            $batches->getCollection()->all(),
            [
                'current_page' => $batches->currentPage(),
                'per_page' => $batches->perPage(),
                'total' => $batches->total(),
                'last_page' => $batches->lastPage(),
            ]
                );
    }

    public function store(HarvestBatchRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Auto-generate batch_code if not provided
        if (empty($data['batch_code'])) {
            $harvest = Harvest::findOrFail($data['harvest_id']);
            $count = HarvestBatch::where('harvest_id', $data['harvest_id'])->count() + 1;
            $data['batch_code'] = 'BAT-' . $harvest->harvest_code . '-' . str_pad((string) $count, 3, '0', STR_PAD_LEFT);
        }

        // Set remaining_quantity equal to quantity if not explicitly provided
        if (!isset($data['remaining_quantity'])) {
            $data['remaining_quantity'] = $data['quantity'];
        }

        $batch = HarvestBatch::create($data);

        $batch->load(['harvest.farm.farmer', 'product', 'unit']);

        return ApiResponse::created('Batch created successfully', $batch);
    }

    public function show(int $id): JsonResponse
    {
        $batch = HarvestBatch::with(['harvest.farm.farmer', 'product', 'unit', 'inventoryItems.warehouse', 'qualityChecks'])->findOrFail($id);

        return ApiResponse::success('Batch fetched successfully', $batch);
    }
}