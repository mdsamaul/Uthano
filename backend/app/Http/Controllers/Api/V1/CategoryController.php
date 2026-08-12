<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->withCount('products')
            ->when($request->boolean('active_only', true), fn ($q) => $q->where('is_active', true))
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
            ->where('is_active', true)
            ->first();

        if (!$category) {
            return ApiResponse::error('Category not found', 404);
        }

        return ApiResponse::success('Category fetched successfully', new CategoryResource($category));
    }
}