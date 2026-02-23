import { api } from "./client";

export interface MetaField {
  name: string;
  type: string;
  required?: boolean;
  label?: string;
}

export interface MetaObject {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  fields: MetaField[];
  createdAt: string;
  modifiedAt: string;
}

export const metaApi = {
  list: (type?: string) => {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    return api<MetaObject[]>(`/meta/objects${qs}`);
  },

  get: (id: string) => api<MetaObject>(`/meta/objects/${id}`),

  create: (data: {
    id?: string;
    name: string;
    description?: string;
    fields: MetaField[];
    type?: string;
  }) => api<MetaObject>("/meta/objects", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: {
    name?: string;
    description?: string;
    fields?: MetaField[];
  }) => api<MetaObject>(`/meta/objects/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string) => api<{ ok: boolean }>(`/meta/objects/${id}`, { method: "DELETE" }),
};
