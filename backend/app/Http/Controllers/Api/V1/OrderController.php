<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Order::query()->with(['items', 'address', 'statusHistories', 'delivery']);

        $user = $request->user();

        // Customers see only their own orders
        if (!$user->isAdmin() && !$user->hasPermission('order.view')) {
            $query->where('customer_id', $user->customerProfile?->id);
        }

        // Filters
        if ($request->has('status') && $request->status) {
            $query->where('order_status', $request->status);
        }
        if ($request->has('payment_status') && $request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->has('customer_id') && $request->customer_id && $user->isAdmin()) {
            $query->where('customer_id', $request->customer_id);
        }
        if ($request->has('from') && $request->from) {
            $query->where('placed_at', '>=', $request->from);
        }
        if ($request->has('to') && $request->to) {
            $query->where('placed_at', '<=', $request->to);
        }
        if ($request->has('search') && $request->search) {
            $query->where('order_number', 'like', "%{$request->search}%");
        }

        $orders = $query->orderByDesc('placed_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Orders fetched successfully',
            OrderResource::collection($orders),
            [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'last_page' => $orders->lastPage(),
            ]
        );
    }

    public function store(OrderRequest $request): JsonResponse
    {
        $customer = $request->user()->customerProfile()->firstOrFail();

        $order = $this->orderService->createOrder(
            $customer,
            $request->items,
            $request->address_id,
            $request->payment_method ?? 'COD',
            $request->notes,
            $request->warehouse_id
        );

        // Clear cart after order placement
        $request->user()->cart?->items()->delete();

        return ApiResponse::created('Order placed successfully', new OrderResource($order));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['items', 'address', 'statusHistories', 'delivery', 'payments'])->findOrFail($id);

        $this->authorize('view', $order);

        return ApiResponse::success('Order fetched successfully', new OrderResource($order));
    }

    public function confirm(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $this->authorize('update', $order);

        $order = $this->orderService->confirmOrder($order, $request->warehouse_id, $request->user()->id);

        return ApiResponse::success('Order confirmed successfully', new OrderResource($order));
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $this->authorize('update', $order);

        $validated = $request->validate([
            'status' => ['required', 'in:' . implode(',', array_column(OrderStatus::cases(), 'value'))],
            'notes' => ['nullable', 'string'],
        ]);

        $order = $this->orderService->updateStatus($order, $validated['status'], $validated['notes'] ?? null, $request->user()->id);

        return ApiResponse::success('Order status updated successfully', new OrderResource($order));
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $this->authorize('cancel', $order);

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $order = $this->orderService->updateStatus(
            $order,
            OrderStatus::CANCELLED->value,
            $validated['reason'] ?? 'Cancelled by customer',
            $request->user()->id
        );

        return ApiResponse::success('Order cancelled successfully', new OrderResource($order));
    }
}