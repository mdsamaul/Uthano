<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\InventoryItemResource;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Services\InventoryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class InventoryController extends Controller
{
    public function __construct(private readonly InventoryService $inventoryService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', InventoryItem::class);

        $query = InventoryItem::query()->with(['product', 'harvestBatch', 'warehouse', 'unit']);

        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('warehouse_id') && $request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        if ($request->has('batch_id') && $request->batch_id) {
            $query->where('harvest_batch_id', $request->batch_id);
        }

        if ($request->boolean('low_stock')) {
            $query->where('available_quantity', '<=', 10);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $items = $query->orderByDesc('updated_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Inventory items fetched successfully',
            InventoryItemResource::collection($items),
            [
                'current_page' => $items->currentPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
                'last_page' => $items->lastPage(),
            ]
        );
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', InventoryItem::class);

        $item = InventoryItem::with(['product', 'harvestBatch.harvest.farm.farmer', 'warehouse', 'unit', 'movements'])->findOrFail($id);

        return ApiResponse::success('Inventory item fetched successfully', new InventoryItemResource($item));
    }

    public function movements(int $id, Request $request): JsonResponse
    {
        $this->authorize('view', InventoryItem::class);

        $movements = InventoryMovement::where('inventory_item_id', $id)
            ->with('createdBy')
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Inventory movements fetched successfully',
            $movements,
            [
                'current_page' => $movements->currentPage(),
                'per_page' => $movements->perPage(),
                'total' => $movements->total(),
                'last_page' => $movements->lastPage(),
            ]
        );
    }

    public function adjust(Request $request, int $id): JsonResponse
    {
        $this->authorize('adjust', InventoryItem::class);

        $validated = $request->validate([
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'movement_type' => ['required', 'in:ADJUSTMENT,DAMAGED,EXPIRED,RETURNED'],
            'notes' => ['nullable', 'string'],
        ]);

        $item = $this->inventoryService->adjustStock(
            $id,
            $validated['quantity'],
            $validated['movement_type'],
            $validated['notes'] ?? null,
            $request->user()->id
        );

        return ApiResponse::success('Inventory adjusted successfully', new InventoryItemResource($item->load(['product', 'harvestBatch', 'warehouse', 'unit'])));
    }

    public function transfer(Request $request): JsonResponse
    {
        $this->authorize('transfer', InventoryItem::class);

        $validated = $request->validate([
            'inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'from_warehouse_id' => ['required', 'exists:warehouses,id'],
            'to_warehouse_id' => ['required', 'exists:warehouses,id', 'different:from_warehouse_id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            $this->inventoryService->transfer(
                $validated['inventory_item_id'],
                $validated['from_warehouse_id'],
                $validated['to_warehouse_id'],
                $validated['quantity'],
                $validated['notes'] ?? null,
                $request->user()->id
            );
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages(['quantity' => [$e->getMessage()]]);
        }

        return ApiResponse::success('Inventory transferred successfully');
    }

    public function traceability(int $orderItemId): JsonResponse
    {
        $this->authorize('view', InventoryItem::class);

        $trace = $this->inventoryService->getTraceability($orderItemId);

        return ApiResponse::success('Traceability fetched successfully', $trace);
    }

    /**
     * Stock IN — receive product quantity from a harvest batch into a warehouse.
     * This is how a product receives its stock (and its farm/farmer source).
     */
    public function receive(Request $request): JsonResponse
    {
        $this->authorize('adjust', InventoryItem::class);

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'harvest_batch_id' => ['required', 'exists:harvest_batches,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_id' => ['required', 'exists:units,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $item = $this->inventoryService->receiveInventory(
            $validated['product_id'],
            $validated['harvest_batch_id'],
            $validated['warehouse_id'],
            (float) $validated['quantity'],
            $validated['unit_id'],
            null,
            $validated['notes'] ?? null,
            $request->user()->id
        );

        return ApiResponse::success(
            'Stock received successfully',
            new InventoryItemResource($item->load(['product', 'harvestBatch.harvest.farm.farmer', 'warehouse', 'unit']))
        );
    }

    /**
     * Stock OUT — manually remove stock (damaged, expired, returned, adjustment).
     */
    public function stockOut(Request $request, int $id): JsonResponse
    {
        $this->authorize('adjust', InventoryItem::class);

        $validated = $request->validate([
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'in:ADJUSTMENT,DAMAGED,EXPIRED,RETURNED'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $item = InventoryItem::findOrFail($id);

        if ($validated['quantity'] > (float) $item->available_quantity) {
            throw ValidationException::withMessages([
                'quantity' => ['Cannot remove more than the available quantity (' . $item->available_quantity . ').'],
            ]);
        }

        $updated = $this->inventoryService->adjustStock(
            $id,
            $validated['quantity'],
            $validated['reason'],
            $validated['notes'] ?? null,
            $request->user()->id
        );

        return ApiResponse::success(
            'Stock removed successfully',
            new InventoryItemResource($updated->load(['product', 'harvestBatch.harvest.farm.farmer', 'warehouse', 'unit']))
        );
    }
}