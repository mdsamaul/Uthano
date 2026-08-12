<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $productService) {}

    public function index(Request $request): JsonResponse
    {
        $products = $this->productService->query($request)->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'Products fetched successfully',
            'data' => [
                'items' => ProductResource::collection($products),
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'from' => $products->firstItem(),
                    'to' => $products->lastItem(),
                ],
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $product = is_numeric($id)
            ? $this->productService->getProduct((int) $id)
            : $this->productService->getProductBySlug($id);

        return ApiResponse::success('Product fetched successfully', new ProductResource($product));
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $this->authorize('create', Product::class);

        $product = Product::create($request->validated());

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'image_path' => $path,
                    'image_url' => asset('storage/' . $path),
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        return ApiResponse::created('Product created successfully', new ProductResource($product->load(['category', 'unit', 'images'])));
    }

    public function update(ProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $this->authorize('update', $product);

        $product->update($request->validated());

        return ApiResponse::success('Product updated successfully', new ProductResource($product->load(['category', 'unit', 'images'])));
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $this->authorize('delete', $product);

        $product->delete();

        return ApiResponse::noContent();
    }
}