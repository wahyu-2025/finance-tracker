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
  },
};
