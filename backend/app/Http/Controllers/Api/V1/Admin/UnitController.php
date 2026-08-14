<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class UnitController extends Controller
{
    /**
     * List all units used by the product form selects.
     */
    public function index(): JsonResponse
    {
        $units = Unit::query()
            ->orderBy('name')
            ->get(['id', 'name', 'symbol']);

        return ApiResponse::success('Units fetched successfully', $units);
    }
}