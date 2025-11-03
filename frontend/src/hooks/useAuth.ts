import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient, {
  setAccessToken,
  setRefreshToken,
  clearTokens,
  getRefreshToken,
} from '../lib/axios';
import {
  AuthResponse,
  BaseResponse,
  LoginCredentials,
  UserProfile,
} from '../types/auth.types';

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    BaseResponse<AuthResponse>,
    Error,
    LoginCredentials
  >({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<BaseResponse<AuthResponse>>(
        '/auth/login',
        credentials,
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAccessToken(data.data.accessToken);
        setRefreshToken(data.data.refreshToken);
        queryClient.setQueryData(['user'], data.data.user);
        navigate('/dashboard');
      }
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<BaseResponse<void>, Error, void>({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          await apiClient.post<BaseResponse<void>>('/auth/logout', {
            refreshToken,
          });
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API call failed:', error);
        }
      }
      return { success: true };
    },
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      navigate('/login');
    },
  });
};

/**
 * Get current user query
 */
export const useCurrentUser = () => {
  return useQuery<UserProfile, Error>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get<BaseResponse<UserProfile>>(
        '/auth/me',
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch user');
      }
      return response.data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { data: user } = useCurrentUser();
  return !!user;
};

