<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FarmerRequest;
use App\Http\Resources\FarmerResource;
use App\Models\Farmer;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Farmer::class);

        $query = Farmer::query()->withCount('farms');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('farmer_code', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('verification_status') && $request->verification_status) {
            $query->where('verification_status', $request->verification_status);
        }

        if ($request->has('district') && $request->district) {
            $query->whereHas('farms', fn ($q) => $q->where('district', $request->district));
        }

        $farmers = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Farmers fetched successfully',
            FarmerResource::collection($farmers),
            [
                'current_page' => $farmers->currentPage(),
                'per_page' => $farmers->perPage(),
                'total' => $farmers->total(),
                'last_page' => $farmers->lastPage(),
            ]
        );
    }

    public function store(FarmerRequest $request): JsonResponse
    {
        $this->authorize('create', Farmer::class);

        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('farmers', 'public');
        }

        $data['farmer_code'] = $this->generateFarmerCode();

        $farmer = Farmer::create($data);

        return ApiResponse::created('Farmer created successfully', new FarmerResource($farmer->load('farms')));
    }

    public function show(int $id): JsonResponse
    {
        $farmer = Farmer::with(['farms.crops', 'farms.harvests', 'sourcingRecords.product'])->findOrFail($id);

        $this->authorize('view', $farmer);

        return ApiResponse::success('Farmer fetched successfully', new FarmerResource($farmer));
    }

    public function update(FarmerRequest $request, int $id): JsonResponse
    {
        $farmer = Farmer::findOrFail($id);
        $this->authorize('update', $farmer);

        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('farmers', 'public');
        }

        $farmer->update($data);

        return ApiResponse::success('Farmer updated successfully', new FarmerResource($farmer->load('farms')));
    }

    public function destroy(int $id): JsonResponse
    {
        $farmer = Farmer::findOrFail($id);
        $this->authorize('delete', $farmer);

        $farmer->delete();

        return ApiResponse::noContent();
    }

    private function generateFarmerCode(): string
    {
        return 'FRM-' . strtoupper(uniqid());
    }
}