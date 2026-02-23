import { api } from "./client";

export interface AuthConfig {
  tenantMode: string;
  mfaEnabled: boolean;
  mfaDefaultMethod: string;
}

export interface AuthUser {
  id: string;
  email: string;
  mobileNumber: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  mfaEnabled: boolean;
  mfaMethod: string | null;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface MfaRequiredResponse {
  mfaRequired: true;
  mfaMethod: string;
  mfaTarget: string;
  mfaToken: string;
  expiresIn: number;
}

export interface MfaSettings {
  mfaEnabled: boolean;
  mfaMethod: string | null;
  globalMfaEnabled: boolean;
  defaultMethod: string;
}

export interface Session {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  lastActiveAt: string;
}

export const authApi = {
  getConfig: () => api<AuthConfig>("/auth/config"),

  register: (data: {
    email: string;
    password: string;
    mobileNumber?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
  }) => api<LoginResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    api<LoginResponse | MfaRequiredResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  loginMfa: (data: { mfaToken: string; mfaCode: string }) =>
    api<LoginResponse>("/auth/login/mfa", { method: "POST", body: JSON.stringify(data) }),

  resendMfa: (data: { mfaToken: string }) =>
    api<{ success: boolean; mfaTarget: string; expiresIn: number }>("/auth/login/mfa/resend", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    api<{ accessToken: string; refreshToken: string; expiresAt: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  forgotPassword: (email: string) =>
    api<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => api<AuthUser>("/auth/me"),

  logout: () => api<{ success: boolean }>("/auth/logout", { method: "POST" }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api<{ success: boolean }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSessions: () => api<{ sessions: Session[] }>("/auth/sessions"),

  deleteSession: (id: string) =>
    api<{ success: boolean }>(`/auth/sessions/${id}`, { method: "DELETE" }),

  getMfaSettings: () => api<MfaSettings>("/auth/mfa/settings"),

  enableMfa: (method?: string) =>
    api<{ success: boolean; method: string }>("/auth/mfa/enable", {
      method: "POST",
      body: JSON.stringify({ method }),
    }),

  disableMfa: () =>
    api<{ success: boolean }>("/auth/mfa/disable", { method: "POST" }),
};
