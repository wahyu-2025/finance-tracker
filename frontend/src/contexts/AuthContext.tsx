import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { UserData, UserService } from '../api/user.service';
import { AuthService, LoginData, RegisterData } from '../api/auth.service';
import { TokenService } from '../api/token';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { fullname: string, email: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(TokenService.getAccessToken());
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cek idle session tiap 1 menit
  const startIdleTimer = () => {
    stopIdleTimer();
    idleTimerRef.current = setInterval(() => {
      if (TokenService.isSessionExpired()) {
        console.log('[Session] Idle 15 menit, logout otomatis');
        logout();
      }
    }, 60 * 1000); // cek tiap 1 menit
  };

  const stopIdleTimer = () => {
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await UserService.getProfile();
          setUser(res.data);
          startIdleTimer(); // mulai timer setelah berhasil load profile
        } catch (error) {
          console.error("Failed to fetch profile", error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchProfile();

    return () => stopIdleTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (data: LoginData) => {
    const res = await AuthService.login(data);
    const accessToken = res.data.token.access_token;
    const refreshToken = res.data.token.refresh_token;
    TokenService.setTokens(accessToken, refreshToken);
    TokenService.touchActivity(); // reset timer dari sekarang
    setToken(accessToken);
    setUser({ id: res.data.id, name: res.data.name, email: res.data.email });
    if (location.pathname === '/login') {
      navigate('/dashboard');
    }
  };

  const register = async (data: RegisterData) => {
    await AuthService.register(data);
    navigate('/login');
  };

  const logout = () => {
    stopIdleTimer();
    TokenService.removeTokens();
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const updateProfile = async (data: { fullname: string, email: string }) => {
    const res = await UserService.updateProfile(data);
    setUser({ ...user, name: res.data.name, email: res.data.email });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
