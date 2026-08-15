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

        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? $this->generateUniqueSlug($data['name']);

        $product = Product::create($data);

        $this->saveImages($product, $request->file('images', []));

        return ApiResponse::created('Product created successfully', new ProductResource($product->load(['category', 'unit', 'images'])));
    }

    public function update(ProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $this->authorize('update', $product);

        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? $this->generateUniqueSlug($data['name'], $product->id);

        $product->update($data);

        if ($request->hasFile('images')) {
            $this->saveImages($product, $request->file('images'), true);
        }

        return ApiResponse::success('Product updated successfully', new ProductResource($product->load(['category', 'unit', 'images'])));
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $this->authorize('delete', $product);

        // Remove product images from storage before deleting the record.
        foreach ($product->images as $image) {
            if ($image->image_path && \Storage::disk('public')->exists($image->image_path)) {
                \Storage::disk('public')->delete($image->image_path);
            }
        }

        $product->delete();

        return ApiResponse::noContent();
    }

    /**
     * Persist uploaded images. When replacing (update flow) the old images
     * are removed from storage so no orphaned files are left behind.
     */
    private function saveImages(Product $product, array $images, bool $replace = false): void
    {
        if ($replace) {
            foreach ($product->images as $existing) {
                if ($existing->image_path && \Storage::disk('public')->exists($existing->image_path)) {
                    \Storage::disk('public')->delete($existing->image_path);
                }
            }
            $product->images()->delete();
        }

        foreach (array_values($images) as $index => $image) {
            $filename = $this->uniqueFilename($image->getClientOriginalName());
            $path = $image->storeAs('products', $filename, 'public');

            $product->images()->create([
                'image_path' => $path,
                'image_url' => \Storage::disk('public')->url($path),
                'is_primary' => $index === 0,
                'sort_order' => $index,
            ]);
        }
    }

    private function uniqueFilename(string $originalName): string
    {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION)) ?: 'jpg';

        return substr(md5(uniqid((string) random_int(1, 999999), true)), 0, 12) . '-' . \Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = \Str::slug($name);
        $slug = $base;
        $counter = 1;

        while (Product::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . $counter++;
        }

        return $slug;
    }
}