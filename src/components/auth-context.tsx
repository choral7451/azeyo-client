"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getCookie, setCookie, removeCookie } from "@/lib/cookie";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AuthContextValue {
  isLoggedIn: boolean;
  accessToken: string | null;
  isLoading: boolean;
  logout: () => void;
  loginWithTokens: (accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  accessToken: null,
  isLoading: true,
  logout: () => {},
  loginWithTokens: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start with null on both server & client to avoid hydration mismatch
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  const isLoggedIn = accessToken !== null;

  // Read cookie + validate on client mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const storedAccessToken = getCookie("accessToken");
    const storedRefreshToken = getCookie("refreshToken");

    if (!storedAccessToken || !storedRefreshToken) {
      setIsLoading(false);
      return;
    }

    // Set token immediately from cookie (so UI is usable right away)
    setAccessToken(storedAccessToken);

    // Then validate in background
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

  // 소켓 연결 관리
  useEffect(() => {
    if (accessToken) {
      const socket = connectSocket(accessToken);
      socket.on("notification", (data: unknown) => {
        window.dispatchEvent(new CustomEvent("socket:notification", { detail: data }));
      });
    } else {
      disconnectSocket();
    }
    return () => { disconnectSocket(); };
  }, [accessToken]);

  const loginWithTokens = useCallback((newAccessToken: string, newRefreshToken: string) => {
    setCookie("accessToken", newAccessToken);
    setCookie("refreshToken", newRefreshToken);
    setAccessToken(newAccessToken);
  }, []);

  const logout = useCallback(() => {
    removeCookie("accessToken");
    removeCookie("refreshToken");
    disconnectSocket();
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, accessToken, isLoading, logout, loginWithTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
