import { API_BASE_URL, API_TIMEOUT, AUTH_ENDPOINTS, USER_ENDPOINTS, CHAT_ENDPOINTS, MATCH_ENDPOINTS, DISCOVERY_ENDPOINTS, NOTIFICATION_ENDPOINTS } from '@/config/api.config';

// ─── Backend-Compatible Types ─────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender?: string;
  photos?: string[];
  bio?: string;
  location?: string;
  distance?: string;
  profession?: string;
  education?: string;
  religion?: string;
  height?: string;
  languages?: string[];
  interests?: string[];
  relationship_goal?: string;
  verification_level?: string;
  trust_score?: number;
  is_online?: boolean;
  last_active?: string;
  title?: string;
  income?: string;
  address?: string;
  email?: string;
  phone?: string;
}

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

export function extractData<T>(response: any): T {
  return response.data ?? response;
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

// ─── Chat API ─────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  match_id: string;
  user1_id: string;
  user2_id: string;
  profile: Profile;
  messages: Message[];
  unread_count: number;
  last_message?: Message;
  updated_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  is_read: boolean;
  created_at: string;
}

export const chatApi = {
  getConversations: () =>
    apiRequest<{ data: Conversation[] }>(`${API_BASE_URL}${CHAT_ENDPOINTS.getConversations}`, { method: 'GET' }),

  getMessages: (conversationId: string) =>
    apiRequest<{ data: Message[] }>(
      `${API_BASE_URL}${CHAT_ENDPOINTS.getMessages.replace(':conversationId', conversationId)}`,
      { method: 'GET' }
    ),

  sendMessage: (conversationId: string, content: string, type = 'text') =>
    apiRequest<{ data: Message }>(
      `${API_BASE_URL}${CHAT_ENDPOINTS.sendMessage.replace(':conversationId', conversationId)}`,
      { method: 'POST', body: JSON.stringify({ content, type }) }
    ),

  markAsRead: (conversationId: string) =>
    apiRequest<{ data: any }>(
      `${API_BASE_URL}${CHAT_ENDPOINTS.markAsRead.replace(':conversationId', conversationId)}`,
      { method: 'POST' }
    ),
};

// ─── Match API ────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  is_new: boolean;
  profile?: Profile;
}

export const matchApi = {
  getMatches: () =>
    apiRequest<{ data: Match[] }>(`${API_BASE_URL}${MATCH_ENDPOINTS.getMatches}`, { method: 'GET' }),

  unmatch: (matchId: string) =>
    apiRequest<{ message: string }>(
      `${API_BASE_URL}${MATCH_ENDPOINTS.unmatch.replace(':matchId', matchId)}`,
      { method: 'DELETE' }
    ),
};

// ─── Discovery API ────────────────────────────────────────────────────────

export interface DiscoveryProfile extends Profile { }


export const discoveryApi = {
  getProfiles: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    const query = qs.toString();
    return apiRequest<{ data: DiscoveryProfile[] }>(
      `${API_BASE_URL}${DISCOVERY_ENDPOINTS.getProfiles}${query ? '?' + query : ''}`,
      { method: 'GET' }
    );
  },

  likeProfile: (profileId: string) =>
    apiRequest<{ data: any }>(
      `${API_BASE_URL}${DISCOVERY_ENDPOINTS.likeProfile.replace(':profileId', profileId)}`,
      { method: 'POST' }
    ),

  passProfile: (profileId: string) =>
    apiRequest<{ data: any }>(
      `${API_BASE_URL}${DISCOVERY_ENDPOINTS.passProfile.replace(':profileId', profileId)}`,
      { method: 'POST' }
    ),

  superLike: (profileId: string) =>
    apiRequest<{ data: any }>(
      `${API_BASE_URL}${DISCOVERY_ENDPOINTS.superLike.replace(':profileId', profileId)}`,
      { method: 'POST' }
    ),
};

// ─── Notification API ─────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: 'match' | 'message' | 'like' | 'superlike' | 'system';
  title: string;
  body: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationApi = {
  getNotifications: () =>
    apiRequest<{ data: Notification[] }>(
      `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.getNotifications}`,
      { method: 'GET' }
    ),

  markAsRead: (notificationId: string) =>
    apiRequest<{ message: string }>(
      `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.markAsRead.replace(':notificationId', notificationId)}`,
      { method: 'POST' }
    ),

  markAllAsRead: () =>
    apiRequest<{ message: string }>(
      `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.markAllAsRead}`,
      { method: 'POST' }
    ),

  unreadCount: () =>
    apiRequest<{ data: { count: number } }>(
      `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.unreadCount}`,
      { method: 'GET' }
    ),
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