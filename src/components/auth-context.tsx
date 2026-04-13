"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getCookie, setCookie, removeCookie } from "@/lib/cookie";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { refreshTokens } from "@/lib/api";

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  accessToken: null,
  myId: null,
  isLoading: true,
  isWriteBanned: false,
  activityPoints: 0,
  logout: () => {},
  loginWithTokens: () => {},
});

interface AuthContextValue {
  isLoggedIn: boolean;
  accessToken: string | null;
  myId: number | null;
  isLoading: boolean;
  isWriteBanned: boolean;
  activityPoints: number;
  logout: () => void;
  loginWithTokens: (accessToken: string, refreshToken: string) => void;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start with null on both server & client to avoid hydration mismatch
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [myId, setMyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteBanned, setIsWriteBanned] = useState(false);
  const [activityPoints, setActivityPoints] = useState(0);
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

    // 싱글턴 refreshTokens 사용 — apiFetch와 동일한 promise를 공유하므로 레이스 컨디션 방지
    refreshTokens()
      .then((refreshed) => {
        if (refreshed) {
          setAccessToken(getCookie("accessToken"));
        } else {
          removeCookie("accessToken");
          removeCookie("refreshToken");
          setAccessToken(null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // 유저 정보 조회 (글쓰기 제한, 유저 ID)
  useEffect(() => {
    if (!accessToken) { setIsWriteBanned(false); setMyId(null); setActivityPoints(0); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/azeyo/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json) {
          const data = json.item ?? json;
          setIsWriteBanned(data.isWriteBanned ?? false);
          setMyId(data.id ?? null);
          setActivityPoints(data.activityPoints ?? 0);
        }
      })
      .catch(() => {});
  }, [accessToken]);

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
    <AuthContext.Provider value={{ isLoggedIn, accessToken, myId, isLoading, isWriteBanned, activityPoints, logout, loginWithTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
