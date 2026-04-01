"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getCookie, setCookie, removeCookie } from "@/lib/cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AuthContextValue {
  isLoggedIn: boolean;
  accessToken: string | null;
  accessTokenRef: React.RefObject<string | null>;
  isLoading: boolean;
  logout: () => void;
  loginWithTokens: (accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  accessToken: null,
  accessTokenRef: { current: null },
  isLoading: true,
  logout: () => {},
  loginWithTokens: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Read cookie synchronously for immediate auth state
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof document === "undefined") return null;
    return getCookie("accessToken");
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof document === "undefined") return true;
    return !!getCookie("accessToken");
  });
  const accessTokenRef = useRef<string | null>(accessToken);
  const validatedRef = useRef(false);

  // Keep ref in sync with state
  accessTokenRef.current = accessToken;

  const isLoggedIn = accessToken !== null;

  // Validate token on mount (async, but UI is already usable)
  useEffect(() => {
    if (validatedRef.current) return;
    validatedRef.current = true;

    const storedAccessToken = getCookie("accessToken");
    const storedRefreshToken = getCookie("refreshToken");

    if (!storedAccessToken || !storedRefreshToken) {
      setAccessToken(null);
      setIsLoading(false);
      return;
    }

    // Validate tokens by calling refresh endpoint
    fetch(`${API_BASE}/azeyo/auths/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Token invalid");
        const data = await res.json();
        const tokens = data.item ?? data;
        setCookie("accessToken", tokens.accessToken);
        setCookie("refreshToken", tokens.refreshToken);
        setAccessToken(tokens.accessToken);
      })
      .catch(() => {
        removeCookie("accessToken");
        removeCookie("refreshToken");
        setAccessToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const loginWithTokens = useCallback((newAccessToken: string, newRefreshToken: string) => {
    setCookie("accessToken", newAccessToken);
    setCookie("refreshToken", newRefreshToken);
    setAccessToken(newAccessToken);
  }, []);

  const logout = useCallback(() => {
    removeCookie("accessToken");
    removeCookie("refreshToken");
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, accessToken, accessTokenRef, isLoading, logout, loginWithTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
