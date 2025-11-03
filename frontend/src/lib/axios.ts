import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Store access token in memory
 */
let accessToken: string | null = null;

/**
 * Store refresh promise to prevent multiple simultaneous refresh calls
 */
let refreshPromise: Promise<string> | null = null;

/**
 * Set access token in memory
 * @param token - Access token
 */
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

/**
 * Get access token from memory
 * @returns Access token or null
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

/**
 * Get refresh token from localStorage
 * @returns Refresh token or null
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * Set refresh token in localStorage
 * @param token - Refresh token
 */
export const setRefreshToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('refreshToken', token);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

/**
 * Clear all tokens
 */
export const clearTokens = (): void => {
  accessToken = null;
  localStorage.removeItem('refreshToken');
};

/**
 * Refresh access token using refresh token
 * @returns New access token
 */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post<{
      success: boolean;
      data?: { accessToken: string; refreshToken: string };
      error?: string;
    }>(`${API_URL}/auth/refresh`, {
      refreshToken,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Token refresh failed');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data.data;

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    return newAccessToken;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

/**
 * Axios instance with interceptors
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to attach access token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor to handle token refresh on 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use existing refresh promise if one is in progress
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken();
        }

        const newAccessToken = await refreshPromise;
        refreshPromise = null;

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        clearTokens();
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

