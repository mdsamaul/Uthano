<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use App\Services\AuditLogService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()->with(['user']);

        // Filters
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('action') && $request->action) {
            $query->where('action', 'like', "%{$request->action}%");
        }
        if ($request->has('auditable_type') && $request->auditable_type) {
            $query->where('auditable_type', $request->auditable_type);
        }
        if ($request->has('auditable_id') && $request->auditable_id) {
            $query->where('auditable_id', $request->auditable_id);
        }
        if ($request->has('from') && $request->from) {
            $query->where('created_at', '>=', $request->from);
        }
        if ($request->has('to') && $request->to) {
            $query->where('created_at', '<=', $request->to);
        }

        $auditLogs = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Audit logs fetched successfully',
            AuditLogResource::collection($auditLogs),
            [
                'current_page' => $auditLogs->currentPage(),
                'per_page' => $auditLogs->perPage(),
                'total' => $auditLogs->total(),
                'last_page' => $auditLogs->lastPage(),
            ]
        );
    }

    public function show(int $id): JsonResponse
    {
        $auditLog = AuditLog::with(['user'])->findOrFail($id);

        return ApiResponse::success('Audit log fetched successfully', new AuditLogResource($auditLog));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $auditLog = AuditLog::findOrFail($id);
        $auditLog->delete();

        return ApiResponse::noContent();
    }

    public function destroyOld(Request $request): JsonResponse
    {
        $days = $request->get('days', 90);
        $deleted = $this->auditLogService->deleteOldLogs($days);

        return ApiResponse::success("Deleted {$deleted} old audit logs");
    }
}