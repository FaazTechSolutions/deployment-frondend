import { api } from "./client";

export interface HealthStatus {
  status: string;
  runtime: string;
}

export interface ProviderHealth {
  database: { ok: boolean; latencyMs?: number };
  storage: { ok: boolean };
  cache: { ok: boolean };
  queue: { ok: boolean };
  sms: { ok: boolean; name: string };
  email: { ok: boolean; name: string };
}

export const healthApi = {
  check: () => api<HealthStatus>("/health"),
  providers: () => api<ProviderHealth>("/health/providers"),
};
