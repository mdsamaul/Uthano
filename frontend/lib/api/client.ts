import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ApiResponse } from '@/types';

// ============================================
// API Configuration
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const TOKEN_KEY = 'uthano_auth_token';

// Cookie used by the edge middleware to authenticate protected routes.
// Must match the cookie name read in middleware.ts (`request.cookies.get('token')`).
const TOKEN_COOKIE_KEY = 'token';
const TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ============================================
// Error Types
// ============================================

export class ApiError extends Error {
  status: number;
  code: string;
  errors?: Record<string, string[]>;
  data?: unknown;

  constructor(
    message: string,
    status: number,
    code: string = 'API_ERROR',
    errors?: Record<string, string[]>,
    data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network connection error. Please check your internet connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Your session has expired. Please login again.') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'The requested resource was not found.') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(errors: Record<string, string[]>, message = 'Validation failed.') {
    super(message, 422, 'VALIDATION_ERROR', errors);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

// ============================================
// Token Management
// ============================================

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    // Mirror the token into a cookie so that middleware (edge runtime)
    // can authenticate protected-route requests after client-side login
    // / register navigation.
    document.cookie = `${TOKEN_COOKIE_KEY}=${encodeURIComponent(
      token
    )}; Path=/; Max-Age=${TOKEN_COOKIE_MAX_AGE}; SameSite=Lax`;
  },
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    // Remove the auth cookie as well.
    document.cookie = `${TOKEN_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  },
};

// ============================================
// Axios Instance
// ============================================

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ============================================
// Request Interceptor
// ============================================

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // For file uploads (multipart/form-data) let the browser generate the
    // boundary automatically — do NOT force the default JSON content type.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      config.headers.delete('Content-Type');
      config.headers.set('Accept', 'application/json');
    }

    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================

client.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      // Network error
      return Promise.reject(new NetworkError());
    }

    const { status, data } = error.response;
    const responseData = data as {
      message?: string;
      errors?: Record<string, string[]>;
      code?: string;
    };

    switch (status) {
      case 401:
        tokenStorage.clear();
        if (typeof window !== 'undefined') {
          // Redirect to login if not already there
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/auth/login')) {
            window.location.href = `/auth/login?redirect=${encodeURIComponent(
              currentPath + window.location.search
            )}`;
          }
        }
        return Promise.reject(
          new UnauthorizedError(responseData?.message || 'Unauthorized')
        );
      case 403:
        return Promise.reject(
          new ForbiddenError(responseData?.message || 'Forbidden')
        );
      case 404:
        return Promise.reject(
          new NotFoundError(responseData?.message || 'Not found')
        );
      case 422:
        return Promise.reject(
          new ValidationError(
            responseData?.errors || {},
            responseData?.message || 'Validation failed'
          )
        );
      case 429:
        return Promise.reject(
          new RateLimitError(responseData?.message || 'Rate limit exceeded')
        );
      case 500:
      case 502:
      case 503:
        return Promise.reject(
          new ApiError(
            'Something went wrong on our end. Please try again later.',
            status,
            'SERVER_ERROR'
          )
        );
      default:
        return Promise.reject(
          new ApiError(
            responseData?.message || 'An unexpected error occurred.',
            status,
            responseData?.code || 'API_ERROR'
          )
        );
    }
  }
);

// ============================================
// API Helper Functions
// ============================================

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await client.get<ApiResponse<T>>(url, config);
  return response.data.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await client.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await client.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await client.patch<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await client.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}

export default client;