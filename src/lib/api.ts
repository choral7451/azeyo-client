import { getCookie, setCookie, removeCookie } from "@/lib/cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const accessToken = getCookie("accessToken");
  const refreshToken = getCookie("refreshToken");
  if (!accessToken || !refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/azeyo/auths/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const tokens = data.item ?? data;
    setCookie("accessToken", tokens.accessToken);
    setCookie("refreshToken", tokens.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { noAuth?: boolean },
): Promise<T> {
  const { noAuth, ...fetchOptions } = options ?? {};

  function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      ...(fetchOptions.headers as Record<string, string>),
    };
    if (!noAuth) {
      const token = getCookie("accessToken");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers: buildHeaders() });

  // 401이면 토큰 리프레시 후 재시도
  if (res.status === 401 && !noAuth) {
    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => { refreshPromise = null; });
    }
    const refreshed = await refreshPromise;

    if (refreshed) {
      res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers: buildHeaders() });
    } else {
      removeCookie("accessToken");
      removeCookie("refreshToken");
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return (json.item ?? json) as T;
}
