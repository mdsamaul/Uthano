<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\DeliveryStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeliveryRequest;
use App\Models\Delivery;
use App\Models\DeliveryStatusHistory;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Delivery::query()->with(['order', 'deliveryAgent', 'deliveryZone', 'pickupWarehouse']);

        $user = $request->user();

        // Delivery agents only see their assigned deliveries
        if ($user->deliveryAgent) {
            $query->where('delivery_agent_id', $user->deliveryAgent->id);
        } else {
            $this->authorize('viewAny', Delivery::class);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('order_id') && $request->order_id) {
            $query->where('order_id', $request->order_id);
        }

        if ($request->has('agent_id') && $request->agent_id && $user->isAdmin()) {
            $query->where('delivery_agent_id', $request->agent_id);
        }

        $deliveries = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Deliveries fetched successfully',
            $deliveries,
            [
                'current_page' => $deliveries->currentPage(),
                'per_page' => $deliveries->perPage(),
                'total' => $deliveries->total(),
                'last_page' => $deliveries->lastPage(),
            ]
        );
    }

    public function store(DeliveryRequest $request): JsonResponse
    {
        $this->authorize('assign', Delivery::class);

        $delivery = DB::transaction(function () use ($request) {
            $delivery = Delivery::create([
                ...$request->validated(),
                'delivery_code' => $this->generateDeliveryCode(),
                'status' => DeliveryStatus::PENDING->value,
            ]);

            $this->recordStatusHistory($delivery, DeliveryStatus::PENDING->value, 'Delivery created', $request->user()->id);

            return $delivery;
        });

        return ApiResponse::created('Delivery created successfully', $delivery->load(['order', 'deliveryAgent', 'deliveryZone']));
    }

    public function show(int $id): JsonResponse
    {
        $delivery = Delivery::with(['order.customer', 'order.items', 'deliveryAgent', 'deliveryZone', 'pickupWarehouse', 'statusHistories'])->findOrFail($id);

        $this->authorize('view', $delivery);

        return ApiResponse::success('Delivery fetched successfully', $delivery);
    }

    public function assign(Request $request, int $id): JsonResponse
    {
        $delivery = Delivery::findOrFail($id);
        $this->authorize('assign', Delivery::class);

        $validated = $request->validate([
            'delivery_agent_id' => ['required', 'exists:delivery_agents,id'],
        ]);

        $delivery->update([
            'delivery_agent_id' => $validated['delivery_agent_id'],
            'assigned_at' => now(),
            'status' => DeliveryStatus::ASSIGNED->value,
        ]);

        $this->recordStatusHistory($delivery, DeliveryStatus::ASSIGNED->value, 'Delivery assigned to agent', $request->user()->id);

        return ApiResponse::success('Delivery assigned successfully', $delivery->load(['order', 'deliveryAgent']));
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $delivery = Delivery::findOrFail($id);
        $this->authorize('update', $delivery);

        $validated = $request->validate([
            'status' => ['required', 'in:' . implode(',', array_column(DeliveryStatus::cases(), 'value'))],
            'notes' => ['nullable', 'string'],
        ]);

        $status = $validated['status'];

        $delivery->update([
            'status' => $status,
            'picked_up_at' => $status === DeliveryStatus::PICKED_UP->value ? now() : $delivery->picked_up_at,
            'out_for_delivery_at' => $status === DeliveryStatus::OUT_FOR_DELIVERY->value ? now() : $delivery->out_for_delivery_at,
            'delivered_at' => $status === DeliveryStatus::DELIVERED->value ? now() : $delivery->delivered_at,
            'failed_at' => $status === DeliveryStatus::FAILED->value ? now() : $delivery->failed_at,
        ]);

        $this->recordStatusHistory($delivery, $status, $validated['notes'] ?? null, $request->user()->id);

        return ApiResponse::success('Delivery status updated successfully', $delivery->load(['order', 'deliveryAgent', 'statusHistories']));
    }

    private function recordStatusHistory(Delivery $delivery, string $status, ?string $notes, ?int $userId): void
    {
        DeliveryStatusHistory::create([
            'delivery_id' => $delivery->id,
            'status' => $status,
            'notes' => $notes,
            'changed_by' => $userId,
        ]);
    }

    private function generateDeliveryCode(): string
    {
        return 'DEL-' . strtoupper(uniqid());
    }
}