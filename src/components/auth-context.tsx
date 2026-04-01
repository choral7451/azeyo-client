"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface AuthContextValue {
  isLoggedIn: boolean;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  loginWithTokens: (accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  accessToken: null,
  login: () => {},
  logout: () => {},
  loginWithTokens: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setIsLoggedIn(true);
    }
  }, []);

  const loginWithTokens = useCallback((newAccessToken: string, newRefreshToken: string) => {
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    setAccessToken(newAccessToken);
    setIsLoggedIn(true);
  }, []);

  const login = useCallback(() => setIsLoggedIn(true), []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, accessToken, login, logout, loginWithTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
