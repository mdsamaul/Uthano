import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
// Matches /admin, /superadmin, /staff, /warehouse_manager, /farmer, /customer, /delivery_agent, /profile
const protectedRoutes = [
  /^\/(admin|superadmin|staff|warehouse_manager|farmer|delivery_agent|delivery|customer|profile)(\/|$)/,
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/products',
  '/about',
  '/contact',
];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => route.test(pathname));
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function getToken(request: NextRequest): string | null {
  // Try to get token from cookie
  const token = request.cookies.get('token')?.value;
  if (token) return token;

  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  if (isProtectedRoute(pathname)) {
    const token = getToken(request);

    if (!token) {
      // No token found - redirect to login with return URL
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }

    // Token exists, let the request proceed
    // Role checking will happen on the client side via RoleProtectedRoute
    const response = NextResponse.next();

    // Add token to response headers for client-side use
    response.headers.set('x-auth-token', token);

    return response;
  }

  // For all other routes, let them proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (API routes handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
