<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeliveryAgentRequest;
use App\Http\Resources\DeliveryAgentResource;
use App\Models\DeliveryAgent;
use App\Services\DeliveryAgentService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryAgentController extends Controller
{
    public function __construct(private readonly DeliveryAgentService $deliveryAgentService) {}

    public function index(Request $request): JsonResponse
    {
        $query = DeliveryAgent::query()->with(['user']);

        // Filters
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('vehicle_type') && $request->vehicle_type) {
            $query->where('vehicle_type', $request->vehicle_type);
        }
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('agent_code', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('vehicle_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $agents = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Delivery agents fetched successfully',
            DeliveryAgentResource::collection($agents),
            [
                'current_page' => $agents->currentPage(),
                'per_page' => $agents->perPage(),
                'total' => $agents->total(),
                'last_page' => $agents->lastPage(),
            ]
        );
    }

    public function show(int $id): JsonResponse
    {
        $agent = DeliveryAgent::with(['user', 'deliveries'])->findOrFail($id);

        return ApiResponse::success('Delivery agent fetched successfully', new DeliveryAgentResource($agent));
    }

    public function store(DeliveryAgentRequest $request): JsonResponse
    {
        $agent = $this->deliveryAgentService->createAgent($request->validated());

        return ApiResponse::created('Delivery agent created successfully', new DeliveryAgentResource($agent->load(['user'])));
    }

    public function update(DeliveryAgentRequest $request, int $id): JsonResponse
    {
        $agent = DeliveryAgent::findOrFail($id);
        $agent = $this->deliveryAgentService->updateAgent($agent, $request->validated());

        return ApiResponse::success('Delivery agent updated successfully', new DeliveryAgentResource($agent->load(['user'])));
    }

    public function destroy(int $id): JsonResponse
    {
        $agent = DeliveryAgent::findOrFail($id);
        $agent->delete();

        return ApiResponse::noContent();
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $agent = DeliveryAgent::findOrFail($id);
        $agent = $this->deliveryAgentService->toggleAgentStatus($agent);

        return ApiResponse::success('Delivery agent status updated successfully', new DeliveryAgentResource($agent->load(['user'])));
    }
}