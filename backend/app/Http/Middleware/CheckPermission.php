<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Super admin has unrestricted access
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        foreach ($permissions as $permission) {
            // Support comma-separated permission strings, e.g. "user.manage,role.manage"
            foreach (array_filter(array_map('trim', explode(',', $permission))) as $perm) {
                if ($user->hasPermission($perm)) {
                    return $next($request);
                }
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Forbidden: insufficient permission',
        ], 403);
    }
}
