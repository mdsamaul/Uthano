<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Services\NotificationService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Notification::query()->where('user_id', $user->id);

        // Filter by read/unread
        if ($request->has('read') && $request->read !== null) {
            if ($request->boolean('read')) {
                $query->whereNotNull('read_at');
            } else {
                $query->whereNull('read_at');
            }
        }

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        $notifications = $query->orderByDesc('created_at')->paginate($request->get('per_page', 20));

        return ApiResponse::paginated(
            'Notifications fetched successfully',
            NotificationResource::collection($notifications),
            [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
            ]
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $notification = Notification::where('user_id', $user->id)->findOrFail($id);

        // Mark as read when viewed
        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return ApiResponse::success('Notification fetched successfully', new NotificationResource($notification));
    }

    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $notification = Notification::where('user_id', $user->id)->findOrFail($id);

        $this->notificationService->markAsRead($notification);

        return ApiResponse::success('Notification marked as read', new NotificationResource($notification));
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->notificationService->markAllAsRead($user->id);

        return ApiResponse::success('All notifications marked as read');
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = Notification::where('user_id', $user->id)->whereNull('read_at')->count();

        return ApiResponse::success('Unread notifications count', [
            'count' => $count,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $notification = Notification::where('user_id', $user->id)->findOrFail($id);
        $notification->delete();

        return ApiResponse::noContent();
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $user = $request->user();
        Notification::where('user_id', $user->id)->delete();

        return ApiResponse::noContent();
    }
}