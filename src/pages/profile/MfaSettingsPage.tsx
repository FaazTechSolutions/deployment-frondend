import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { authApi, type MfaSettings } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";

export function MfaSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const { data, loading, error, reload } = useApi<MfaSettings>(() => authApi.getMfaSettings(), []);
  const [busy, setBusy] = useState(false);

  async function handleEnable(method?: string) {
    setBusy(true);
    try {
      await authApi.enableMfa(method);
      toast("MFA enabled");
      reload();
      refreshUser();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to enable MFA", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    try {
      await authApi.disableMfa();
      toast("MFA disabled");
      reload();
      refreshUser();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to disable MFA", "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">MFA Settings</h1>
        <Button variant="secondary" onClick={() => navigate("/profile")}>Back</Button>
      </div>

      <Card title="Multi-Factor Authentication">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Status</span>
            <Badge color={data.mfaEnabled ? "green" : "gray"}>{data.mfaEnabled ? "Enabled" : "Disabled"}</Badge>
          </div>
          {data.mfaMethod && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Method</span>
              <span className="text-sm font-medium">{data.mfaMethod}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Global MFA Policy</span>
            <Badge color={data.globalMfaEnabled ? "yellow" : "gray"}>{data.globalMfaEnabled ? "Required" : "Optional"}</Badge>
          </div>

          <div className="border-t border-gray-200 pt-4">
            {data.mfaEnabled ? (
              <Button variant="danger" loading={busy} onClick={handleDisable} disabled={data.globalMfaEnabled}>
                {data.globalMfaEnabled ? "Cannot disable (required by policy)" : "Disable MFA"}
              </Button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button loading={busy} onClick={() => handleEnable("sms")}>Enable via SMS</Button>
                <Button loading={busy} variant="secondary" onClick={() => handleEnable("email")}>Enable via Email</Button>
                <Button loading={busy} variant="secondary" onClick={() => handleEnable("totp")}>Enable via TOTP</Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
