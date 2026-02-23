import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi, type AuthUser, type LoginResponse, type MfaRequiredResponse } from "../api/auth";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  /** Permissions derived from the user's role names (matched against well-known roles). */
  permissions: string[];
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<LoginResponse | MfaRequiredResponse>;
  loginMfa: (mfaToken: string, mfaCode: string) => Promise<void>;
  register: (data: Parameters<typeof authApi.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["*:*"],
  admin: [
    "users:read", "users:create", "users:update", "users:delete",
    "roles:read", "roles:create", "roles:update", "roles:delete",
    "meta_objects:read", "meta_objects:create", "meta_objects:update", "meta_objects:delete",
    "audit:read", "settings:read", "settings:update",
  ],
  editor: ["meta_objects:read", "meta_objects:create", "meta_objects:update"],
  viewer: ["meta_objects:read", "users:read"],
};

function resolvePermissions(roles: string[]): string[] {
  const perms = new Set<string>();
  for (const role of roles) {
    const rp = ROLE_PERMISSIONS[role];
    if (rp) rp.forEach((p) => perms.add(p));
  }
  return [...perms];
}

function storeTokens(res: LoginResponse) {
  localStorage.setItem("accessToken", res.accessToken);
  localStorage.setItem("refreshToken", res.refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, permissions: [] });

  const setUser = useCallback((user: AuthUser | null) => {
    const permissions = user ? resolvePermissions(user.roles ?? []) : [];
    setState({ user, loading: false, permissions });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authApi.me();
      setUser(user);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      refreshUser();
    } else {
      setState({ user: null, loading: false, permissions: [] });
    }
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if ("mfaRequired" in res && res.mfaRequired) return res;
    storeTokens(res as LoginResponse);
    setUser((res as LoginResponse).user);
    return res;
  }, [setUser]);

  const loginMfa = useCallback(async (mfaToken: string, mfaCode: string) => {
    const res = await authApi.loginMfa({ mfaToken, mfaCode });
    storeTokens(res);
    setUser(res.user);
  }, [setUser]);

  const register = useCallback(async (data: Parameters<typeof authApi.register>[0]) => {
    const res = await authApi.register(data);
    storeTokens(res);
    setUser(res.user);
  }, [setUser]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearTokens();
    setUser(null);
  }, [setUser]);

  const hasPermission = useCallback((perm: string) => {
    if (state.permissions.includes("*:*")) return true;
    if (state.permissions.includes(perm)) return true;
    const [resource] = perm.split(":");
    return state.permissions.includes(`${resource}:*`);
  }, [state.permissions]);

  return (
    <AuthContext.Provider value={{ ...state, login, loginMfa, register, logout, refreshUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
