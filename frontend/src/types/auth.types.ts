/**
 * Authentication response type
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

/**
 * Base API response type
 */
export interface BaseResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * User profile type
 */
export interface UserProfile {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
}

