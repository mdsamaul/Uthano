<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PackagingTypeRequest;
use App\Http\Resources\PackagingTypeResource;
use App\Models\PackagingType;
use App\Services\PackagingTypeService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackagingTypeController extends Controller
{
    public function __construct(private readonly PackagingTypeService $packagingTypeService) {}

    public function index(Request $request): JsonResponse
    {
        $query = PackagingType::query();

        // Filters
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        if ($request->has('is_reusable') && $request->is_reusable !== null) {
            $query->where('is_reusable', $request->boolean('is_reusable'));
        }
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        $packagingTypes = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Packaging types fetched successfully',
            PackagingTypeResource::collection($packagingTypes),
            [
                'current_page' => $packagingTypes->currentPage(),
                'per_page' => $packagingTypes->perPage(),
                'total' => $packagingTypes->total(),
                'last_page' => $packagingTypes->lastPage(),
            ]
        );
    }

    public function show(int $id): JsonResponse
    {
        $packagingType = PackagingType::withCount('packagingItems')->findOrFail($id);

        return ApiResponse::success('Packaging type fetched successfully', new PackagingTypeResource($packagingType));
    }

    public function store(PackagingTypeRequest $request): JsonResponse
    {
        $packagingType = $this->packagingTypeService->createPackagingType($request->validated());

        return ApiResponse::created('Packaging type created successfully', new PackagingTypeResource($packagingType->loadCount('packagingItems')));
    }

    public function update(PackagingTypeRequest $request, int $id): JsonResponse
    {
        $packagingType = PackagingType::findOrFail($id);
        $packagingType = $this->packagingTypeService->updatePackagingType($packagingType, $request->validated());

        return ApiResponse::success('Packaging type updated successfully', new PackagingTypeResource($packagingType->loadCount('packagingItems')));
    }

    public function destroy(int $id): JsonResponse
    {
        $packagingType = PackagingType::findOrFail($id);
        $packagingType->delete();

        return ApiResponse::noContent();
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $packagingType = PackagingType::findOrFail($id);
        $packagingType = $this->packagingTypeService->togglePackagingType($packagingType);

        return ApiResponse::success('Packaging type status updated successfully', new PackagingTypeResource($packagingType->loadCount('packagingItems')));
    }
}