import { authPost, post } from '@/lib/api';
import { deleteStoredToken, getStoredToken, setStoredToken } from '@/lib/token-storage';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AuthUser {
  id: string;
  phone_number: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  user_type: string;
}

interface PinLoginData {
  token: string;
  userId: string;
  username: string;
  email: string | null;
  phoneCode: string | null;
  phoneNumber: string;
  message: string | null;
}

interface PinLoginResponse {
  success: boolean;
  message: string;
  data: PinLoginData;
  timestamp: string;
  path: string | null;
}

interface PasswordTokenResponse {
  access: string;
  refresh: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  loginWithPassword: (phoneNumber: string, password: string) => Promise<void>;
  loginWithPin: (phoneNumber: string, pin: string) => Promise<void>;
  setPin: (pin: string, confirmPin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getStoredToken(ACCESS_TOKEN_KEY);
        if (token) {
          setAccessToken(token);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const storeTokens = useCallback(async (access: string, refresh?: string) => {
    await setStoredToken(ACCESS_TOKEN_KEY, access);
    if (refresh) {
      await setStoredToken(REFRESH_TOKEN_KEY, refresh);
    }
    setAccessToken(access);
  }, []);

  const loginWithPassword = useCallback(
    async (phoneNumber: string, password: string) => {
      const response = await post<PasswordTokenResponse>('/users/token/', {
        phone_number: phoneNumber,
        password,
      });
      await storeTokens(response.access, response.refresh);
    },
    [storeTokens],
  );

  const loginWithPin = useCallback(
    async (phoneNumber: string, pin: string) => {
      const response = await post<PinLoginResponse>('/api/auth/login/pin', {
        phoneNumber,
        pin,
      });
      setUser({
        id: response.data.userId,
        phone_number: response.data.phoneNumber,
        first_name: response.data.username,
        last_name: null,
        email: response.data.email,
        user_type: 'user',
      });
      await storeTokens(response.data.token);
    },
    [storeTokens],
  );

  const setPin = useCallback(
    async (pin: string, confirmPin: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      await authPost('/users/set-pin/', { pin, confirm_pin: confirmPin }, accessToken);
    },
    [accessToken],
  );

  const logout = useCallback(async () => {
    await deleteStoredToken(ACCESS_TOKEN_KEY);
    await deleteStoredToken(REFRESH_TOKEN_KEY);
    setUser(null);
    setAccessToken(null);
    router.replace('/login');
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, loginWithPassword, loginWithPin, setPin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
