import { api } from "./client";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  isSystem: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

export const rolesApi = {
  list: () => api<{ roles: Role[] }>("/roles"),

  get: (id: string) => api<Role>(`/roles/${id}`),

  create: (data: { name: string; description?: string; parentId?: string }) =>
    api<Role>("/roles", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: { name?: string; description?: string; parentId?: string }) =>
    api<Role>(`/roles/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string) => api<{ success: boolean }>(`/roles/${id}`, { method: "DELETE" }),

  getPermissions: (id: string) =>
    api<{ permissions: Permission[] }>(`/roles/${id}/permissions`),

  updatePermissions: (id: string, permissionIds: string[]) =>
    api<{ success: boolean }>(`/roles/${id}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissionIds }),
    }),

  getAllPermissions: () =>
    api<{ permissions: Permission[] }>("/roles/permissions/all"),
};
