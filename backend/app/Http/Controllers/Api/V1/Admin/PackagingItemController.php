<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PackagingItemRequest;
use App\Http\Resources\PackagingItemResource;
use App\Models\PackagingItem;
use App\Services\PackagingItemService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackagingItemController extends Controller
{
    public function __construct(private readonly PackagingItemService $packagingItemService) {}

    public function index(Request $request): JsonResponse
    {
        $query = PackagingItem::query()->with(['packagingType', 'warehouse']);

        // Filters
        if ($request->has('packaging_type_id') && $request->packaging_type_id) {
            $query->where('packaging_type_id', $request->packaging_type_id);
        }
        if ($request->has('warehouse_id') && $request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $query->where('code', 'like', "%{$request->search}%");
        }

        $packagingItems = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Packaging items fetched successfully',
            PackagingItemResource::collection($packagingItems),
            [
                'current_page' => $packagingItems->currentPage(),
                'per_page' => $packagingItems->perPage(),
                'total' => $packagingItems->total(),
                'last_page' => $packagingItems->lastPage(),
            ]
        );
    }

    public function show(int $id): JsonResponse
    {
        $packagingItem = PackagingItem::with(['packagingType', 'warehouse'])->findOrFail($id);

        return ApiResponse::success('Packaging item fetched successfully', new PackagingItemResource($packagingItem));
    }

    public function store(PackagingItemRequest $request): JsonResponse
    {
        $packagingItem = $this->packagingItemService->createPackagingItem($request->validated());

        return ApiResponse::created('Packaging item created successfully', new PackagingItemResource($packagingItem->load(['packagingType', 'warehouse'])));
    }

    public function update(PackagingItemRequest $request, int $id): JsonResponse
    {
        $packagingItem = PackagingItem::findOrFail($id);
        $packagingItem = $this->packagingItemService->updatePackagingItem($packagingItem, $request->validated());

        return ApiResponse::success('Packaging item updated successfully', new PackagingItemResource($packagingItem->load(['packagingType', 'warehouse'])));
    }

    public function destroy(int $id): JsonResponse
    {
        $packagingItem = PackagingItem::findOrFail($id);
        $packagingItem->delete();

        return ApiResponse::noContent();
    }

    public function movements(Request $request, int $id): JsonResponse
    {
        $packagingItem = PackagingItem::findOrFail($id);
        $movements = $this->packagingItemService->getMovements($packagingItem);

        return ApiResponse::success('Packaging movements fetched successfully', PackagingMovementResource::collection($movements));
    }
}