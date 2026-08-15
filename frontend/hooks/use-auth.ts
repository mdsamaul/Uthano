import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { authService } from '@/services';
import { tokenStorage } from '@/lib/api/client';
import { LoginCredentials, RegisterData, User } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, setUser, logout: clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = tokenStorage.get();
      if (storedToken && !isAuthenticated) {
        try {
          const currentUser = await authService.getCurrentUser();
          // Re-establish the middleware cookie so protected-route
          // navigations after hydration are authorized.
          tokenStorage.set(storedToken);
          setAuth(currentUser, storedToken);
        } catch {
          tokenStorage.clear();
          clearAuth();
        }
      }
      setIsRestoring(false);
    };

    restoreSession();
  }, [isAuthenticated, setAuth, clearAuth]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const response = await authService.login(credentials);
        tokenStorage.set(response.token);
        setAuth(response.user, response.token);
        return response.user;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      setIsLoading(true);
      try {
        const response = await authService.register(data);
        tokenStorage.set(response.token);
        setAuth(response.user, response.token);
        return response.user;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    }
    tokenStorage.clear();
    clearAuth();
    router.push('/');
  }, [clearAuth, router]);

  const updateUser = useCallback(
    (updatedUser: User) => {
      setUser(updatedUser);
    },
    [setUser]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isRestoring,
    login,
    register,
    logout,
    updateUser,
  };
}