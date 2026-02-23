import { useApi } from "../../hooks/useApi";
import { healthApi, type ProviderHealth, type HealthStatus } from "../../api/health";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { Activity, Database, HardDrive, MemoryStick, Inbox, Smartphone, Mail } from "lucide-react";

function StatusBadge({ ok }: { ok: boolean }) {
  return <Badge color={ok ? "green" : "red"}>{ok ? "Healthy" : "Down"}</Badge>;
}

export function DashboardPage() {
  const { user } = useAuth();
  const health = useApi<HealthStatus>(() => healthApi.check(), []);
  const providers = useApi<ProviderHealth>(() => healthApi.providers(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.displayName || user?.email}</p>
      </div>

      {/* Runtime info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2"><Activity className="h-5 w-5 text-indigo-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="font-semibold text-gray-900">
                {health.loading ? "..." : health.data?.status === "ok" ? "Running" : "Error"}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2"><Activity className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Runtime</p>
              <p className="font-semibold text-gray-900">{health.loading ? "..." : health.data?.runtime ?? "—"}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2"><Activity className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Your Roles</p>
              <p className="font-semibold text-gray-900">{user?.roles?.join(", ") || "—"}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Provider health */}
      <Card title="Provider Health">
        {providers.loading ? (
          <Spinner />
        ) : providers.error ? (
          <p className="text-sm text-red-600">{providers.error}</p>
        ) : providers.data ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ProviderCard icon={<Database className="h-5 w-5" />} name="Database" ok={providers.data.database.ok} detail={providers.data.database.latencyMs != null ? `${providers.data.database.latencyMs}ms` : undefined} />
            <ProviderCard icon={<HardDrive className="h-5 w-5" />} name="Storage" ok={providers.data.storage.ok} />
            <ProviderCard icon={<MemoryStick className="h-5 w-5" />} name="Cache" ok={providers.data.cache.ok} />
            <ProviderCard icon={<Inbox className="h-5 w-5" />} name="Queue" ok={providers.data.queue.ok} />
            <ProviderCard icon={<Smartphone className="h-5 w-5" />} name={`SMS (${providers.data.sms.name})`} ok={providers.data.sms.ok} />
            <ProviderCard icon={<Mail className="h-5 w-5" />} name={`Email (${providers.data.email.name})`} ok={providers.data.email.ok} />
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function ProviderCard({ icon, name, ok, detail }: { icon: React.ReactNode; name: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{name}</p>
        {detail && <p className="text-xs text-gray-400">{detail}</p>}
      </div>
      <StatusBadge ok={ok} />
    </div>
  );
}
