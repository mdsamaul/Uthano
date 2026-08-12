<?php

namespace App\Services;

use App\Enums\HarvestBatchStatus;
use App\Enums\InventoryMovementType;
use App\Models\HarvestBatch;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\OrderItem;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InventoryService
{
    /**
     * Receive inventory into a warehouse from a harvest batch.
     * Uses FIFO by default for perishable products.
     */
    public function receiveInventory(
        int $productId,
        int $harvestBatchId,
        int $warehouseId,
        float $quantity,
        int $unitId,
        ?int $orderItemId = null,
        ?string $notes = null,
        ?int $createdBy = null
    ): InventoryItem {
        return DB::transaction(function () use ($productId, $harvestBatchId, $warehouseId, $quantity, $unitId, $orderItemId, $notes, $createdBy) {
            // Lock the inventory item row for update
            $inventory = InventoryItem::where('product_id', $productId)
                ->where('harvest_batch_id', $harvestBatchId)
                ->where('warehouse_id', $warehouseId)
                ->lockForUpdate()
                ->first();

            $before = $inventory?->quantity ?? 0;

            if ($inventory) {
                $inventory->quantity += $quantity;
                $inventory->available_quantity += $quantity;
                $inventory->save();
            } else {
                $inventory = InventoryItem::create([
                    'product_id' => $productId,
                    'harvest_batch_id' => $harvestBatchId,
                    'warehouse_id' => $warehouseId,
                    'quantity' => $quantity,
                    'reserved_quantity' => 0,
                    'available_quantity' => $quantity,
                    'unit_id' => $unitId,
                    'status' => 'ACTIVE',
                ]);
            }

            // Update batch remaining quantity
            $batch = HarvestBatch::find($harvestBatchId);
            if ($batch) {
                $batch->remaining_quantity += $quantity;
                $batch->status = HarvestBatchStatus::AVAILABLE->value;
                $batch->save();
            }

            // Create inventory movement
            $this->recordMovement(
                $inventory,
                InventoryMovementType::IN->value,
                $quantity,
                $before,
                $inventory->quantity,
                $orderItemId,
                $notes,
                $createdBy
            );

            return $inventory;
        });
    }

    /**
     * Reserve inventory for an order (when order is confirmed).
     * Allocates from available batches using FIFO.
     */
    public function reserveForOrder(OrderItem $orderItem, int $warehouseId, ?int $createdBy = null): void
    {
        DB::transaction(function () use ($orderItem, $warehouseId, $createdBy) {
            $remainingNeeded = $orderItem->quantity;

            // FIFO: order by oldest harvest date first
            $inventoryItems = InventoryItem::where('product_id', $orderItem->product_id)
                ->where('warehouse_id', $warehouseId)
                ->where('available_quantity', '>', 0)
                ->whereHas('harvestBatch', function ($q) {
                    $q->whereIn('status', [HarvestBatchStatus::AVAILABLE->value, HarvestBatchStatus::PARTIALLY_SOLD->value]);
                })
                ->orderBy('created_at')
                ->lockForUpdate()
                ->get();

            foreach ($inventoryItems as $inventory) {
                if ($remainingNeeded <= 0) {
                    break;
                }

                $allocated = min($remainingNeeded, (float) $inventory->available_quantity);

                $quantityBefore = (float) $inventory->quantity;
                $inventory->reserved_quantity += $allocated;
                $inventory->available_quantity -= $allocated;
                $inventory->save();

                // Update batch status
                $batch = $inventory->harvestBatch;
                $batch->remaining_quantity -= $allocated;
                $batch->status = $batch->remaining_quantity <= 0
                    ? HarvestBatchStatus::SOLD_OUT->value
                    : HarvestBatchStatus::PARTIALLY_SOLD->value;
                $batch->save();

                // Record movement
                $this->recordMovement(
                    $inventory,
                    InventoryMovementType::RESERVED->value,
                    $allocated,
                    $quantityBefore,
                    $inventory->quantity,
                    $orderItem->id,
                    'Reserved for order ' . $orderItem->order->order_number,
                    $createdBy
                );

                $remainingNeeded -= $allocated;
            }

            if ($remainingNeeded > 0) {
                throw new RuntimeException('Insufficient inventory for product: ' . $orderItem->product_name);
            }
        });
    }

    /**
     * Deduct reserved inventory (when order is packed/dispatched).
     */
    public function deductReserved(OrderItem $orderItem, ?int $createdBy = null): void
    {
        DB::transaction(function () use ($orderItem, $createdBy) {
            $movements = InventoryMovement::where('order_item_id', $orderItem->id)
                ->where('movement_type', InventoryMovementType::RESERVED->value)
                ->get();

            foreach ($movements as $movement) {
                $inventory = $movement->inventoryItem;

                if ($inventory->reserved_quantity < $movement->quantity) {
                    throw new RuntimeException('Reserved quantity mismatch for inventory item: ' . $inventory->id);
                }

                $quantityBefore = (float) $inventory->quantity;
                $inventory->reserved_quantity -= $movement->quantity;
                $inventory->quantity -= $movement->quantity;
                $inventory->save();

                $this->recordMovement(
                    $inventory,
                    InventoryMovementType::OUT->value,
                    $movement->quantity,
                    $quantityBefore,
                    $inventory->quantity,
                    $orderItem->id,
                    'Dispatched for order ' . $orderItem->order->order_number,
                    $createdBy
                );
            }
        });
    }

    /**
     * Release reserved inventory (when order is cancelled).
     */
    public function releaseReserved(OrderItem $orderItem, ?int $createdBy = null): void
    {
        DB::transaction(function () use ($orderItem, $createdBy) {
            $movements = InventoryMovement::where('order_item_id', $orderItem->id)
                ->where('movement_type', InventoryMovementType::RESERVED->value)
                ->get();

            foreach ($movements as $movement) {
                $inventory = $movement->inventoryItem;

                $quantityBefore = (float) $inventory->quantity;
                $inventory->reserved_quantity -= $movement->quantity;
                $inventory->available_quantity += $movement->quantity;
                $inventory->save();

                // Restore batch remaining
                $batch = $inventory->harvestBatch;
                $batch->remaining_quantity += $movement->quantity;
                $batch->status = HarvestBatchStatus::AVAILABLE->value;
                $batch->save();

                $this->recordMovement(
                    $inventory,
                    InventoryMovementType::RELEASED->value,
                    $movement->quantity,
                    $quantityBefore,
                    $inventory->quantity,
                    $orderItem->id,
                    'Released for cancelled order ' . $orderItem->order->order_number,
                    $createdBy
                );
            }
        });
    }

    /**
     * Adjust stock (for damaged, expired, etc.)
     */
    public function adjustStock(
        int $inventoryItemId,
        float $quantity,
        string $movementType,
        ?string $notes = null,
        ?int $createdBy = null
    ): InventoryItem {
        return DB::transaction(function () use ($inventoryItemId, $quantity, $movementType, $notes, $createdBy) {
            $inventory = InventoryItem::findOrFail($inventoryItemId);

            $quantityBefore = (float) $inventory->quantity;
            $inventory->quantity -= $quantity;
            $inventory->available_quantity -= $quantity;
            $inventory->save();

            // Update batch
            $batch = $inventory->harvestBatch;
            $batch->remaining_quantity -= $quantity;
            if ($movementType === InventoryMovementType::EXPIRED->value) {
                $batch->status = HarvestBatchStatus::EXPIRED->value;
            }
            $batch->save();

            $this->recordMovement(
                $inventory,
                $movementType,
                $quantity,
                $quantityBefore,
                $inventory->quantity,
                null,
                $notes,
                $createdBy
            );

            return $inventory;
        });
    }

    /**
     * Transfer inventory between warehouses.
     */
    public function transfer(
        int $inventoryItemId,
        int $fromWarehouseId,
        int $toWarehouseId,
        float $quantity,
        ?string $notes = null,
        ?int $createdBy = null
    ): void {
        DB::transaction(function () use ($inventoryItemId, $fromWarehouseId, $toWarehouseId, $quantity, $notes, $createdBy) {
            $inventory = InventoryItem::where('id', $inventoryItemId)
                ->where('warehouse_id', $fromWarehouseId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($inventory->available_quantity < $quantity) {
                throw new RuntimeException('Insufficient available quantity for transfer');
            }

            // Deduct from source
            $quantityBefore = (float) $inventory->quantity;
            $inventory->quantity -= $quantity;
            $inventory->available_quantity -= $quantity;
            $inventory->save();

            $this->recordMovement(
                $inventory,
                InventoryMovementType::TRANSFER_OUT->value,
                $quantity,
                $quantityBefore,
                $inventory->quantity,
                null,
                $notes,
                $createdBy
            );

            // Add to destination
            $this->receiveInventory(
                $inventory->product_id,
                $inventory->harvest_batch_id,
                $toWarehouseId,
                $quantity,
                $inventory->unit_id,
                null,
                $notes,
                $createdBy
            );
        });
    }

    /**
     * Get full traceability chain for an order item.
     */
    public function getTraceability(int $orderItemId): array
    {
        $orderItem = OrderItem::with([
            'product',
            'sourceBatch.harvest.farm.farmer',
            'sourceBatch.harvest.farmCrop',
            'sourceBatch.inventoryItems.warehouse',
        ])->findOrFail($orderItemId);

        $batch = $orderItem->sourceBatch;

        return [
            'order' => [
                'order_number' => $orderItem->order->order_number,
                'order_item_id' => $orderItem->id,
                'product_name' => $orderItem->product_name,
                'quantity' => $orderItem->quantity,
            ],
            'batch' => $batch ? [
                'batch_code' => $batch->batch_code,
                'harvested_at' => $batch->harvested_at?->toISOString(),
                'quantity' => (float) $batch->quantity,
                'remaining_quantity' => (float) $batch->remaining_quantity,
                'quality_grade' => $batch->quality_grade,
                'status' => $batch->status,
            ] : null,
            'harvest' => optional($batch?->harvest)->only([
                'harvest_code',
                'harvest_date',
                'actual_quantity',
                'quality_grade',
            ]),
            'farm' => optional($batch?->harvest?->farm)->only([
                'farm_code',
                'farm_name',
                'district',
                'upazila',
                'village',
            ]),
            'farmer' => optional($batch?->harvest?->farm?->farmer)->only([
                'farmer_code',
                'full_name',
                'phone',
            ]),
            'warehouse' => $batch?->inventoryItems->first()?->warehouse?->only([
                'warehouse_code',
                'name',
                'district',
            ]),
        ];
    }

    private function recordMovement(
        InventoryItem $inventory,
        string $movementType,
        float $quantity,
        float $quantityBefore,
        float $quantityAfter,
        ?int $orderItemId,
        ?string $notes,
        ?int $createdBy
    ): void {
        InventoryMovement::create([
            'inventory_item_id' => $inventory->id,
            'order_item_id' => $orderItemId,
            'movement_type' => $movementType,
            'quantity' => $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'reference_type' => $movementType === InventoryMovementType::IN->value ? 'harvest_batch' : 'order',
            'reference_id' => $movementType === InventoryMovementType::IN->value ? $inventory->harvest_batch_id : $orderItemId,
            'notes' => $notes,
            'created_by' => $createdBy,
        ]);
    }
}