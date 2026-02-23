import { api } from "./client";

export interface User {
  id: string;
  email: string;
  mobileNumber: string | null;
  displayName: string | null;
  isActive: boolean;
  mfaEnabled: boolean;
  roles: string[];
  createdAt: string;
  modifiedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
}

export interface PaginatedUsers {
  users: User[];
  pagination: { total: number; limit: number; offset: number; hasMore: boolean };
}

export const usersApi = {
  list: (params?: { limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    const qs = q.toString();
    return api<PaginatedUsers>(`/users${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => api<User>(`/users/${id}`),

  create: (data: {
    email: string;
    password: string;
    mobileNumber?: string;
    displayName?: string;
    isActive?: boolean;
    roles?: string[];
  }) => api<User>("/users", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: {
    email?: string;
    mobileNumber?: string;
    displayName?: string;
    isActive?: boolean;
  }) => api<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string) => api<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),

  activate: (id: string) =>
    api<User>(`/users/${id}/activate`, { method: "POST" }),

  getRoles: (id: string) => api<{ roles: Role[] }>(`/users/${id}/roles`),

  assignRole: (userId: string, roleId: string, expiresAt?: string) =>
    api<{ success: boolean }>(`/users/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify({ roleId, expiresAt }),
    }),

  removeRole: (userId: string, roleId: string) =>
    api<{ success: boolean }>(`/users/${userId}/roles/${roleId}`, { method: "DELETE" }),

  resetPassword: (userId: string, newPassword: string) =>
    api<{ success: boolean }>(`/users/${userId}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    }),
};
