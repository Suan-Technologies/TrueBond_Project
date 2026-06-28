/** =============================================================================
 * API Configuration File
 * =============================================================================
 * Is file mein saari API URLs, endpoints aur related config centralized hai.
 * Environment (dev/staging/prod) ke hisaab se base URL auto-switch hota hai.
 * ============================================================================= */

// ─── Environment ───────────────────────────────────────────────────────────
type Environment = 'development' | 'staging' | 'production';

const ENV: Environment = (import.meta.env.VITE_APP_ENV as Environment) || 'development';

// ─── Base URLs ─────────────────────────────────────────────────────────────
const BASE_URLS: Record<Environment, string> = {
  development:  import.meta.env.VITE_API_BASE_URL  || 'http://localhost:8080/api/v1',
  staging:      import.meta.env.VITE_API_BASE_URL  || 'https://staging-api.trustbond.app/api/v1',
  production:   import.meta.env.VITE_API_BASE_URL  || 'https://api.trustbond.app/api/v1',
};

export const API_BASE_URL = BASE_URLS[ENV];

// ─── Timeout / Retry ───────────────────────────────────────────────────────
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000; // ms
export const API_RETRY_COUNT = Number(import.meta.env.VITE_API_RETRY_COUNT) || 1;

// ─── Auth Endpoints ────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  register:           '/auth/register',
  login:              '/auth/login',
  logout:             '/auth/logout',
  refreshToken:       '/auth/refresh',
  forgotPassword:     '/auth/forgot-password',
  resetPassword:      '/auth/reset-password',
  verifyEmail:        '/auth/verify-email',
  resendOtp:          '/auth/resend-otp',
  socialLogin:        '/auth/social',
} as const;

// ─── User / Profile Endpoints ──────────────────────────────────────────────
export const USER_ENDPOINTS = {
  me:                 '/users/me',
  updateProfile:      '/users/me',
  uploadPhoto:        '/users/me/photos',
  deletePhoto:        '/users/me/photos/:photoId',
  updatePreferences:  '/users/me/preferences',
  deleteAccount:      '/users/me',
  blockUser:          '/users/:userId/block',
  reportUser:         '/users/:userId/report',
} as const;

// ─── Discovery / Feed Endpoints ─────────────────────────────────────────────
export const DISCOVERY_ENDPOINTS = {
  getProfiles:        '/discovery/profiles',
  likeProfile:        '/discovery/:profileId/like',
  passProfile:        '/discovery/:profileId/pass',
  superLike:          '/discovery/:profileId/superlike',
  rewind:             '/discovery/rewind',
  boost:              '/discovery/boost',
} as const;

// ─── Match Endpoints ───────────────────────────────────────────────────────
export const MATCH_ENDPOINTS = {
  getMatches:         '/matches',
  getMatchById:       '/matches/:matchId',
  unmatch:            '/matches/:matchId',
} as const;

// ─── Chat / Message Endpoints ──────────────────────────────────────────────
export const CHAT_ENDPOINTS = {
  getConversations:   '/conversations',
  getConversation:    '/conversations/:conversationId',
  getMessages:        '/conversations/:conversationId/messages',
  sendMessage:        '/conversations/:conversationId/messages',
  markAsRead:         '/conversations/:conversationId/read',
  deleteMessage:      '/conversations/:conversationId/messages/:messageId',
} as const;

// ─── Verification Endpoints ────────────────────────────────────────────────
export const VERIFICATION_ENDPOINTS = {
  sendPhoneOtp:       '/verification/phone/send',
  verifyPhone:        '/verification/phone/verify',
  sendEmailOtp:       '/verification/email/send',
  verifyEmail:        '/verification/email/verify',
  startFaceVerification: '/verification/face/start',
  submitFaceVerification: '/verification/face/submit',
  uploadId:           '/verification/id/upload',
} as const;

// ─── Premium / Subscription Endpoints ────────────────────────────────────────
export const PREMIUM_ENDPOINTS = {
  getPlans:           '/premium/plans',
  getCurrentPlan:     '/premium/me',
  subscribe:          '/premium/subscribe',
  cancelSubscription: '/premium/cancel',
  applyPromoCode:     '/premium/promo',
} as const;

// ─── Payment Endpoints ─────────────────────────────────────────────────────
export const PAYMENT_ENDPOINTS = {
  createOrder:        '/payments/order',
  verifyPayment:      '/payments/verify',
  getTransactions:    '/payments/transactions',
} as const;

// ─── Admin Endpoints ───────────────────────────────────────────────────────
export const ADMIN_ENDPOINTS = {
  getDashboardStats:  '/admin/dashboard',
  getUsers:           '/admin/users',
  getReports:         '/admin/reports',
  resolveReport:      '/admin/reports/:reportId',
  sendAnnouncement:   '/admin/announcements',
} as const;

// ─── Utility ───────────────────────────────────────────────────────────────

/**
 * Endpoint mein dynamic params (jaise :userId, :matchId) replace karne ka helper.
 * 
 * Usage:
 *   buildUrl(USER_ENDPOINTS.deletePhoto, { photoId: 'abc123' })
 *   // => /users/me/photos/abc123
 */
export function buildUrl(
  endpoint: string,
  params?: Record<string, string | number>
): string {
  if (!params) return endpoint;
  return Object.entries(params).reduce((url, [key, value]) => {
    return url.replace(`:${key}`, String(value));
  }, endpoint);
}

/**
 * Full URL banane ka helper — base URL + endpoint + query params.
 * 
 * Usage:
 *   buildFullUrl(DISCOVERY_ENDPOINTS.getProfiles, undefined, { page: 1, limit: 20 })
 *   // => https://api.TrueBond.app/api/v1/discovery/profiles?page=1&limit=20
 */
export function buildFullUrl(
  endpoint: string,
  pathParams?: Record<string, string | number>,
  queryParams?: Record<string, string | number | boolean | undefined>
): string {
  let url = buildUrl(endpoint, pathParams);

  if (queryParams) {
    const qs = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) qs.append(key, String(value));
    });
    const queryString = qs.toString();
    if (queryString) url += `?${queryString}`;
  }

  return `${API_BASE_URL}${url}`;
}

// ─── Default Export ────────────────────────────────────────────────────────
const API_CONFIG = {
  ENV,
  API_BASE_URL,
  API_TIMEOUT,
  API_RETRY_COUNT,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  DISCOVERY_ENDPOINTS,
  MATCH_ENDPOINTS,
  CHAT_ENDPOINTS,
  VERIFICATION_ENDPOINTS,
  PREMIUM_ENDPOINTS,
  PAYMENT_ENDPOINTS,
  ADMIN_ENDPOINTS,
  buildUrl,
  buildFullUrl,
} as const;

export default API_CONFIG;
