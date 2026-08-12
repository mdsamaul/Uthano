<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\CustomerAddress;
use App\Models\CustomerProfile;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OrderService
{
    public function __construct(
        private readonly InventoryService $inventoryService
    ) {}

    /**
     * Create an order from cart items.
     */
    public function createOrder(
        CustomerProfile $customer,
        array $items,
        int $addressId,
        string $paymentMethod = 'COD',
        ?string $notes = null,
        ?int $warehouseId = null
    ): Order {
        return DB::transaction(function () use ($customer, $items, $addressId, $paymentMethod, $notes, $warehouseId) {
            $address = CustomerAddress::where('id', $addressId)
                ->where('customer_profile_id', $customer->id)
                ->firstOrFail();

            $subtotal = 0;
            $orderItemsData = [];

            foreach ($items as $item) {
                $product = \App\Models\Product::findOrFail($item['product_id']);

                if (!$product->is_active || $product->status !== 'ACTIVE') {
                    throw new RuntimeException("Product {$product->name} is not available");
                }

                $quantity = $item['quantity'];
                if ($quantity < $product->minimum_order_quantity) {
                    throw new RuntimeException("Minimum order quantity for {$product->name} is {$product->minimum_order_quantity}");
                }

                if ($product->maximum_order_quantity && $quantity > $product->maximum_order_quantity) {
                    throw new RuntimeException("Maximum order quantity for {$product->name} is {$product->maximum_order_quantity}");
                }

                $unitPrice = $product->selling_price;
                $lineTotal = $unitPrice * $quantity;
                $subtotal += $lineTotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_id' => $product->unit_id,
                    'unit_price' => $unitPrice,
                    'discount' => 0,
                    'total' => $lineTotal,
                ];
            }

            $deliveryCharge = 0; // TODO: calculate from delivery zone
            $total = $subtotal + $deliveryCharge;

            // Create order
            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'customer_id' => $customer->id,
                'address_id' => $address->id,
                'subtotal' => $subtotal,
                'discount' => 0,
                'delivery_charge' => $deliveryCharge,
                'tax' => null,
                'total' => $total,
                'currency' => 'BDT',
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
                'order_status' => OrderStatus::PENDING->value,
                'notes' => $notes,
                'placed_at' => now(),
            ]);

            // Create order items
            foreach ($orderItemsData as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    ...$itemData,
                ]);
            }

            // Record status history
            $this->recordStatusHistory($order, OrderStatus::PENDING->value, 'Order placed');

            // Create payment record
            Payment::create([
                'order_id' => $order->id,
                'payment_code' => 'PAY-' . strtoupper(uniqid()),
                'amount' => $total,
                'payment_method' => $paymentMethod,
                'status' => 'PENDING',
            ]);

            return $order->load(['items', 'address', 'statusHistories', 'payments']);
        });
    }

    /**
     * Confirm an order - reserves inventory.
     */
    public function confirmOrder(Order $order, ?int $warehouseId = null, ?int $userId = null): Order
    {
        return DB::transaction(function () use ($order, $warehouseId, $userId) {
            if ($order->order_status !== OrderStatus::PENDING->value) {
                throw new RuntimeException('Only pending orders can be confirmed');
            }

            $order->load('items');

            // Reserve inventory for each item
            foreach ($order->items as $item) {
                $this->inventoryService->reserveForOrder($item, $warehouseId ?? $this->getDefaultWarehouseId(), $userId);

                // Update order item with source batch
                $movement = \App\Models\InventoryMovement::where('order_item_id', $item->id)
                    ->where('movement_type', 'RESERVED')
                    ->first();

                if ($movement) {
                    $item->source_batch_id = $movement->inventoryItem->harvest_batch_id;
                    $item->save();
                }
            }

            $order->update([
                'order_status' => OrderStatus::CONFIRMED->value,
                'confirmed_at' => now(),
            ]);

            $this->recordStatusHistory($order, OrderStatus::CONFIRMED->value, 'Order confirmed, inventory reserved');

            return $order->load(['items', 'statusHistories']);
        });
    }

    /**
     * Update order status.
     */
    public function updateStatus(Order $order, string $newStatus, ?string $notes = null, ?int $userId = null): Order
    {
        return DB::transaction(function () use ($order, $newStatus, $notes, $userId) {
            $oldStatus = $order->order_status;

            $order->update([
                'order_status' => $newStatus,
                'delivered_at' => $newStatus === OrderStatus::DELIVERED->value ? now() : $order->delivered_at,
                'cancelled_at' => $newStatus === OrderStatus::CANCELLED->value || $newStatus === OrderStatus::RETURNED->value ? now() : $order->cancelled_at,
            ]);

            $this->recordStatusHistory($order, $newStatus, $notes, $userId);

            // If cancelled, release reserved inventory
            if ($newStatus === OrderStatus::CANCELLED->value && $oldStatus === OrderStatus::CONFIRMED->value) {
                $order->load('items');
                foreach ($order->items as $item) {
                    $this->inventoryService->releaseReserved($item, $userId);
                }
            }

            // If packed, deduct reserved inventory
            if ($newStatus === OrderStatus::PACKED->value && $oldStatus === OrderStatus::CONFIRMED->value) {
                $order->load('items');
                foreach ($order->items as $item) {
                    $this->inventoryService->deductReserved($item, $userId);
                }
            }

            return $order->load(['items', 'statusHistories']);
        });
    }

    private function recordStatusHistory(Order $order, string $status, ?string $notes = null, ?int $userId = null): void
    {
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => $status,
            'notes' => $notes,
            'changed_by' => $userId,
        ]);
    }

    private function generateOrderNumber(): string
    {
        return 'UTH-' . strtoupper(uniqid());
    }

    private function getDefaultWarehouseId(): int
    {
        $warehouse = \App\Models\Warehouse::where('status', 'ACTIVE')->first();
        if (!$warehouse) {
            throw new RuntimeException('No active warehouse configured');
        }
        return $warehouse->id;
    }
}