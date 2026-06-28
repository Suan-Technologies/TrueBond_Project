import { API_BASE_URL, API_TIMEOUT, AUTH_ENDPOINTS, USER_ENDPOINTS } from '@/config/api.config';
import type { Profile } from '@/store/useStore';

// ─── Helper: Refresh Token (avoid circular dependency) ───────────────────

async function doRefreshToken(refreshToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(`${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

// ─── Helper: API Request ───────────────────────────────────────────────────

let refreshingPromise: Promise<AuthResponse> | null = null;

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const doFetch = async (accessToken: string | null) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    const isJsonBody = typeof options.body === 'string';
    const headers: Record<string, string> = {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        credentials: 'include',
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  let response = await doFetch(getAccessToken());

  if (response.status === 401 && !url.includes('/auth/refresh')) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      throw new Error('SESSION_EXPIRED');
    }
    if (!refreshingPromise) {
      refreshingPromise = doRefreshToken(refreshToken)
        .then((res) => {
          setTokens(res.access_token, res.refresh_token);
          return res;
        })
        .catch(() => {
          clearTokens();
          throw new Error('SESSION_EXPIRED');
        })
        .finally(() => {
          refreshingPromise = null;
        });
    }
    try {
      await refreshingPromise;
    } catch (err) {
      throw new Error('SESSION_EXPIRED');
    }
    response = await doFetch(getAccessToken());
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
  }
  return data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  title?: string;
  address?: string;
  income?: string;
  phone: string;
  password: string;
  age?: number;
  gender?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface OTPResendRequest {
  email: string;
  purpose: 'verify_email' | 'verify_phone' | 'reset_password';
}

export interface PasswordResetRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface AuthResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterResponse {
  user_id: string;
  message: string;
}

export const authApi = {
  register: (body: RegisterRequest) =>
    apiRequest<RegisterResponse>(`${API_BASE_URL}${AUTH_ENDPOINTS.register}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: LoginRequest) =>
    apiRequest<AuthResponse>(`${API_BASE_URL}${AUTH_ENDPOINTS.login}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  verifyEmail: (body: OTPVerifyRequest) =>
    apiRequest<AuthResponse>(`${API_BASE_URL}${AUTH_ENDPOINTS.verifyEmail}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resendOtp: (body: OTPResendRequest) =>
    apiRequest<{ message: string }>(`${API_BASE_URL}${AUTH_ENDPOINTS.resendOtp}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  forgotPassword: (body: { email: string }) =>
    apiRequest<{ message: string }>(`${API_BASE_URL}${AUTH_ENDPOINTS.forgotPassword}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resetPassword: (body: PasswordResetRequest) =>
    apiRequest<{ message: string }>(`${API_BASE_URL}${AUTH_ENDPOINTS.resetPassword}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () => {
    const rt = getRefreshToken();
    return apiRequest<void>(`${API_BASE_URL}${AUTH_ENDPOINTS.logout}`, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: rt }),
    });
  },

  refreshToken: (refreshToken: string) => doRefreshToken(refreshToken),

  getMe: () => apiRequest<Profile>(`${API_BASE_URL}${USER_ENDPOINTS.me}`, { method: 'GET' }),
};

// ─── Token Helpers ─────────────────────────────────────────────────────────

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}
