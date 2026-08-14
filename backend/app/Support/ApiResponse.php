<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(string $message, mixed $data = null, int $status = 200, array $meta = []): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $status);
    }

    public static function created(string $message, mixed $data = null): JsonResponse
    {
        return self::success($message, $data, 201);
    }

    public static function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    public static function error(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }

                    public static function paginated(string $message, mixed $data, array $pagination): JsonResponse
    {
        // Emit the { items, meta } wrapper the frontend expects
        // (PaginatedData<T> = { items: T[]; meta: PaginationMeta }).
        $pagination = array_merge([
            'from' => 1,
            'to'   => $pagination['total'] ?? 0,
        ], $pagination);

        return self::success($message, [
            'items' => $data,
            'meta'  => $pagination,
        ]);
    }
}