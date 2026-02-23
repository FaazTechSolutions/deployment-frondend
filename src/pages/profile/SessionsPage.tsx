import { useApi } from "../../hooks/useApi";
import { authApi, type Session } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import { Trash2, Monitor } from "lucide-react";
import { formatDate } from "../../lib/utils";

export function SessionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, loading, error, reload } = useApi<{ sessions: Session[] }>(() => authApi.getSessions(), []);

  async function handleDelete(id: string) {
    try {
      await authApi.deleteSession(id);
      toast("Session revoked");
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to revoke session", "error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
        <Button variant="secondary" onClick={() => navigate("/profile")}>Back</Button>
      </div>

      {loading ? <Spinner /> : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <Card>
          {(data?.sessions ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No active sessions.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data!.sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-4 py-3">
                  <Monitor className="h-5 w-5 shrink-0 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{s.userAgent || "Unknown device"}</p>
                    <p className="text-xs text-gray-500">
                      {s.ipAddress || "Unknown IP"} &middot; Last active {formatDate(s.lastActiveAt)}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(s.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
