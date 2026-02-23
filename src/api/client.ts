const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: Record<string, unknown>,
  ) {
    super((body.message as string) ?? `API error ${status}`);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return false;
  }

  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return true;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = localStorage.getItem("accessToken");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && token) {
    if (!refreshPromise) {
      refreshPromise = tryRefreshToken().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      const newToken = localStorage.getItem("accessToken")!;
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
