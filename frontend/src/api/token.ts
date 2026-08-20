const LAST_ACTIVITY_KEY = 'last_activity_time';
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 menit

export const TokenService = {
  getAccessToken: (): string | null => localStorage.getItem('access_token'),
  getRefreshToken: (): string | null => localStorage.getItem('refresh_token'),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  setAccessToken: (accessToken: string) => {
    localStorage.setItem('access_token', accessToken);
  },
  removeTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  },

  // Activity tracking untuk sliding session
  touchActivity: () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  },
  isSessionExpired: (): boolean => {
    const last = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!last) return false; // belum pernah hit API, biarkan token yang handle
    return Date.now() - Number(last) > SESSION_TIMEOUT_MS;
  },
};
