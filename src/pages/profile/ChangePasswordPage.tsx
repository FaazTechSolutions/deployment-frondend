import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (newPwd !== confirm) { setError("Passwords do not match"); return; }
    if (newPwd.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: newPwd });
      toast("Password changed successfully");
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Current Password" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          <Input label="New Password" type="password" required value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          <Input label="Confirm New Password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Change Password</Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/profile")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
