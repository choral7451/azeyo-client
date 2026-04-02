import { getCookie } from "@/lib/cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { noAuth?: boolean },
): Promise<T> {
  const { noAuth, ...fetchOptions } = options ?? {};
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

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return (json.item ?? json) as T;
}
