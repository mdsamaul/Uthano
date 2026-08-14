<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->withCount('products')
            ->when($request->boolean('active_only', true) && !$request->user()?->isAdmin(), fn ($q) => $q->where('is_active', true))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return ApiResponse::success('Categories fetched successfully', CategoryResource::collection($categories));
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::query()
            ->withCount('products')
            ->where('slug', $slug)
            ->first();

        if (!$category) {
            return ApiResponse::error('Category not found', 404);
        }

        return ApiResponse::success('Category fetched successfully', new CategoryResource($category));
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $data = $request->validated();

        if (!$request->filled('slug')) {
            $data['slug'] = Str::slug($data['name']);
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category = Category::create($data);

        return ApiResponse::created('Category created successfully', new CategoryResource($category->loadCount('products')));
    }

    public function update(CategoryRequest $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $this->authorize('update', $category);

        $data = $request->validated();

        if ($request->filled('slug')) {
            $data['slug'] = Str::slug($data['slug']);
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);

        return ApiResponse::success('Category updated successfully', new CategoryResource($category->loadCount('products')));
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $this->authorize('delete', $category);

        if ($category->products()->exists()) {
            return ApiResponse::error('Cannot delete category with products', 409);
        }

        $category->delete();

        return ApiResponse::noContent();
    }
}