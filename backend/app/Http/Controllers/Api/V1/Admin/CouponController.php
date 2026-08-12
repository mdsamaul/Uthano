<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Services\CouponService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(private readonly CouponService $couponService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query();

        // Filters
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }
        if ($request->has('search') && $request->search) {
            $query->where('code', 'like', "%{$request->search}%");
        }

        $coupons = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Coupons fetched successfully',
            CouponResource::collection($coupons),
            [
                'current_page' => $coupons->currentPage(),
                'per_page' => $coupons->perPage(),
                'total' => $coupons->total(),
                'last_page' => $coupons->lastPage(),
            ]
        );
    }

    public function show(int $id): JsonResponse
    {
        $coupon = Coupon::withCount('usages')->findOrFail($id);

        return ApiResponse::success('Coupon fetched successfully', new CouponResource($coupon));
    }

    public function store(CouponRequest $request): JsonResponse
    {
        $coupon = $this->couponService->createCoupon($request->validated());

        return ApiResponse::created('Coupon created successfully', new CouponResource($coupon->loadCount('usages')));
    }

    public function update(CouponRequest $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon = $this->couponService->updateCoupon($coupon, $request->validated());

        return ApiResponse::success('Coupon updated successfully', new CouponResource($coupon->loadCount('usages')));
    }

    public function destroy(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return ApiResponse::noContent();
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon = $this->couponService->toggleCoupon($coupon);

        return ApiResponse::success('Coupon status updated successfully', new CouponResource($coupon->loadCount('usages')));
    }
}