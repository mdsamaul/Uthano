<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Flatten comma-separated role strings passed via `role:superadmin,admin,staff`
        $flat = [];
        foreach ($roles as $role) {
            foreach (array_filter(array_map('trim', explode(',', $role))) as $r) {
                $flat[] = $r;
            }
        }

        if (!$user->hasAnyRole($flat) && !$user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: insufficient role',
            ], 403);
        }

        return $next($request);
    }
}
