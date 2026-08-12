<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CartItemRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService) {}

    public function index(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request->user()->id);

        return ApiResponse::success('Cart fetched successfully', new CartResource($cart));
    }

    public function storeItem(CartItemRequest $request): JsonResponse
    {
        $item = $this->cartService->addItem(
            $request->user()->id,
            $request->product_id,
            $request->quantity
        );

        $cart = $this->cartService->getCart($request->user()->id);

        return ApiResponse::created('Item added to cart successfully', new CartResource($cart));
    }

    public function updateItem(CartItemRequest $request, int $id): JsonResponse
    {
        $this->cartService->updateItem($request->user()->id, $id, $request->quantity);

        $cart = $this->cartService->getCart($request->user()->id);

        return ApiResponse::success('Cart item updated successfully', new CartResource($cart));
    }

    public function destroyItem(Request $request, int $id): JsonResponse
    {
        $this->cartService->removeItem($request->user()->id, $id);

        $cart = $this->cartService->getCart($request->user()->id);

        return ApiResponse::success('Cart item removed successfully', new CartResource($cart));
    }

    public function destroy(Request $request): JsonResponse
    {
        $this->cartService->clearCart($request->user()->id);

        return ApiResponse::success('Cart cleared successfully');
    }
}