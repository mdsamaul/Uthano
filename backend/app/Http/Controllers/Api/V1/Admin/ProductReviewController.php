<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductReviewRequest;
use App\Http\Resources\ProductReviewResource;
use App\Models\ProductReview;
use App\Services\ProductReviewService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function __construct(private readonly ProductReviewService $productReviewService) {}

    public function index(Request $request): JsonResponse
    {
        $query = ProductReview::query()
            ->with(['customer', 'product', 'order']);

        // Filters
        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->has('customer_id') && $request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('rating') && $request->rating) {
            $query->where('rating', $request->rating);
        }
        if ($request->has('from') && $request->from) {
            $query->where('created_at', '>=', $request->from);
        }
        if ($request->has('to') && $request->to) {
            $query->where('created_at', '<=', $request->to);
        }

        $reviews = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Product reviews fetched successfully',
            ProductReviewResource::collection($reviews),
            [
                'current_page' => $reviews->currentPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
                'last_page' => $reviews->lastPage(),
            ]
        );
    }

    public function show(int $id): JsonResponse
    {
        $review = ProductReview::with(['customer', 'product', 'order', 'images'])->findOrFail($id);

        return ApiResponse::success('Product review fetched successfully', new ProductReviewResource($review));
    }

    public function store(ProductReviewRequest $request): JsonResponse
    {
        $review = $this->productReviewService->createReview(
            $request->validated(),
            $request->user()->customerProfile->id
        );

        return ApiResponse::created('Product review created successfully', new ProductReviewResource($review->load(['customer', 'product', 'order', 'images'])));
    }

    public function update(ProductReviewRequest $request, int $id): JsonResponse
    {
        $review = ProductReview::findOrFail($id);
        $review = $this->productReviewService->updateReview($review, $request->validated());

        return ApiResponse::success('Product review updated successfully', new ProductReviewResource($review->load(['customer', 'product', 'order', 'images'])));
    }

    public function destroy(int $id): JsonResponse
    {
        $review = ProductReview::findOrFail($id);
        $review->delete();

        return ApiResponse::noContent();
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $review = ProductReview::findOrFail($id);
        $review = $this->productReviewService->approveReview($review);

        return ApiResponse::success('Product review approved successfully', new ProductReviewResource($review->load(['customer', 'product', 'order', 'images'])));
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $review = ProductReview::findOrFail($id);
        $review = $this->productReviewService->rejectReview($review, $validated['reason']);

        return ApiResponse::success('Product review rejected successfully', new ProductReviewResource($review->load(['customer', 'product', 'order', 'images'])));
    }
}