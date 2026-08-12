<?php

namespace App\Services;

use App\Enums\HarvestBatchStatus;
use App\Enums\SourcingStatus;
use App\Models\HarvestBatch;
use App\Models\SourcingRecord;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SourcingService
{
    public function __construct(private readonly InventoryService $inventoryService) {}

    public function createSourcingRecord(array $data): SourcingRecord
    {
        return DB::transaction(function () use ($data) {
            $batch = HarvestBatch::findOrFail($data['harvest_batch_id']);

            if ($batch->remaining_quantity < $data['quantity']) {
                throw new RuntimeException('Insufficient batch quantity for sourcing');
            }

            $totalCost = $data['quantity'] * $data['purchase_price'];
            $totalProcurementCost = $totalCost
                + ($data['transport_cost'] ?? 0)
                + ($data['packaging_cost'] ?? 0)
                + ($data['other_cost'] ?? 0);

            $record = SourcingRecord::create([
                'sourcing_code' => $this->generateSourcingCode(),
                'farmer_id' => $data['farmer_id'],
                'farm_id' => $data['farm_id'],
                'harvest_batch_id' => $data['harvest_batch_id'],
                'product_id' => $data['product_id'],
                'quantity' => $data['quantity'],
                'unit_id' => $data['unit_id'],
                'purchase_price' => $data['purchase_price'],
                'total_cost' => $totalCost,
                'transport_cost' => $data['transport_cost'] ?? 0,
                'packaging_cost' => $data['packaging_cost'] ?? 0,
                'other_cost' => $data['other_cost'] ?? 0,
                'total_procurement_cost' => $totalProcurementCost,
                'sourced_at' => $data['sourced_at'] ?? now(),
                'warehouse_id' => $data['warehouse_id'] ?? null,
                'status' => SourcingStatus::PURCHASED->value,
                'notes' => $data['notes'] ?? null,
            ]);

            // Update batch status
            $batch->status = HarvestBatchStatus::COLLECTED->value;
            $batch->save();

            return $record;
        });
    }

    public function receiveSourcingRecord(int $id): SourcingRecord
    {
        return DB::transaction(function () use ($id) {
            $record = SourcingRecord::findOrFail($id);

            if ($record->status !== SourcingStatus::PURCHASED->value) {
                throw new RuntimeException('Only purchased sourcing records can be received');
            }

            if (!$record->warehouse_id) {
                throw new RuntimeException('Warehouse is required to receive sourcing record');
            }

            // Receive inventory into warehouse
            $this->inventoryService->receiveInventory(
                $record->product_id,
                $record->harvest_batch_id,
                $record->warehouse_id,
                $record->quantity,
                $record->unit_id,
                null,
                'Received from sourcing ' . $record->sourcing_code
            );

            $record->update([
                'status' => SourcingStatus::RECEIVED->value,
                'received_at' => now(),
            ]);

            return $record;
        });
    }

    private function generateSourcingCode(): string
    {
        return 'SRC-' . strtoupper(uniqid());
    }
}