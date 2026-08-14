<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function summary(Request $request): JsonResponse
    {
        $summary = $this->dashboardService->getDashboardSummary();

        return ApiResponse::success('Dashboard summary fetched successfully', $summary);
    }

    public function stats(Request $request): JsonResponse
    {
        $stats = $this->dashboardService->getStats();

        return ApiResponse::success('Dashboard stats fetched successfully', $stats);
    }

    public function salesChart(Request $request): JsonResponse
    {
        $days = min((int) $request->get('days', 30), 90);

        return ApiResponse::success('Sales chart data fetched successfully', $this->dashboardService->getSalesChart($days));
    }

    public function topProducts(Request $request): JsonResponse
    {
        $limit = min((int) $request->get('limit', 10), 50);

        return ApiResponse::success('Top products fetched successfully', $this->dashboardService->getTopProducts($limit));
    }

    public function topFarms(Request $request): JsonResponse
    {
        $limit = min((int) $request->get('limit', 10), 50);

        return ApiResponse::success('Top farms fetched successfully', $this->dashboardService->getTopFarms($limit));
    }
}