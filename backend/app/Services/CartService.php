<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CartService
{
    public function getCart(int $userId): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $userId],
            ['session_id' => null]
        )->load(['items.product.images', 'items.product.unit', 'items.product.category']);
    }

    public function addItem(int $userId, int $productId, float $quantity): CartItem
    {
        return DB::transaction(function () use ($userId, $productId, $quantity) {
            $product = Product::findOrFail($productId);

            if (!$product->is_active || $product->status !== 'ACTIVE') {
                throw new RuntimeException('Product is not available');
            }

            if ($quantity < $product->minimum_order_quantity) {
                throw new RuntimeException("Minimum order quantity is {$product->minimum_order_quantity}");
            }

            if ($product->maximum_order_quantity && $quantity > $product->maximum_order_quantity) {
                throw new RuntimeException("Maximum order quantity is {$product->maximum_order_quantity}");
            }

            $cart = $this->getCart($userId);

            $existingItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $productId)
                ->first();

            $unitPrice = $product->selling_price;

            if ($existingItem) {
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $quantity,
                    'unit_price' => $unitPrice,
                    'total' => ($existingItem->quantity + $quantity) * $unitPrice,
                ]);
                return $existingItem;
            }

            return CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total' => $quantity * $unitPrice,
            ]);
        });
    }

    public function updateItem(int $userId, int $itemId, float $quantity): CartItem
    {
        return DB::transaction(function () use ($userId, $itemId, $quantity) {
            $cart = $this->getCart($userId);
            $item = CartItem::where('id', $itemId)
                ->where('cart_id', $cart->id)
                ->firstOrFail();

            $product = $item->product;

            if ($quantity < $product->minimum_order_quantity) {
                throw new RuntimeException("Minimum order quantity is {$product->minimum_order_quantity}");
            }

            if ($product->maximum_order_quantity && $quantity > $product->maximum_order_quantity) {
                throw new RuntimeException("Maximum order quantity is {$product->maximum_order_quantity}");
            }

            $item->update([
                'quantity' => $quantity,
                'total' => $quantity * $item->unit_price,
            ]);

            return $item;
        });
    }

    public function removeItem(int $userId, int $itemId): void
    {
        $cart = $this->getCart($userId);
        CartItem::where('id', $itemId)
            ->where('cart_id', $cart->id)
            ->delete();
    }

    public function clearCart(int $userId): void
    {
        $cart = $this->getCart($userId);
        $cart->items()->delete();
    }
}