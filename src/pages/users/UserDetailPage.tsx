import { useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { usersApi, type User, type Role } from "../../api/users";
import { rolesApi } from "../../api/roles";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import { Trash2 } from "lucide-react";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  const { data: user, loading, error, reload } = useApi<User>(() => usersApi.get(id!), [id]);
  const userRoles = useApi<{ roles: Role[] }>(() => usersApi.getRoles(id!), [id]);
  const allRoles = useApi<{ roles: Role[] }>(() => rolesApi.list().then((r) => ({ roles: r.roles })), []);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ email: "", displayName: "", mobileNumber: "" });
  const [saving, setSaving] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  function startEditing() {
    if (!user) return;
    setForm({ email: user.email, displayName: user.displayName || "", mobileNumber: user.mobileNumber || "" });
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.update(id!, {
        email: form.email,
        displayName: form.displayName || undefined,
        mobileNumber: form.mobileNumber || undefined,
      });
      toast("User updated");
      setEditing(false);
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!user) return;
    try {
      if (user.isActive) {
        await usersApi.delete(id!);
        toast("User deactivated");
      } else {
        await usersApi.activate(id!);
        toast("User activated");
      }
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  async function handleAssignRole() {
    if (!selectedRoleId) return;
    try {
      await usersApi.assignRole(id!, selectedRoleId);
      toast("Role assigned");
      setShowRoleModal(false);
      setSelectedRoleId("");
      userRoles.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to assign role", "error");
    }
  }

  async function handleRemoveRole(roleId: string) {
    try {
      await usersApi.removeRole(id!, roleId);
      toast("Role removed");
      userRoles.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to remove role", "error");
    }
  }

  async function handleResetPassword() {
    if (newPassword.length < 8) { toast("Password must be at least 8 characters", "error"); return; }
    try {
      await usersApi.resetPassword(id!, newPassword);
      toast("Password reset");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reset password", "error");
    }
  }

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!user) return null;

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const canEdit = hasPermission("users:update");
  const canDelete = hasPermission("users:delete");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Detail</h1>
        <Button variant="secondary" onClick={() => navigate("/users")}>Back</Button>
      </div>

      {/* User info */}
      <Card
        title="Account"
        actions={
          canEdit && !editing ? (
            <Button variant="secondary" size="sm" onClick={startEditing}>Edit</Button>
          ) : undefined
        }
      >
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Email" type="email" required value={form.email} onChange={set("email")} />
            <Input label="Display Name" value={form.displayName} onChange={set("displayName")} />
            <Input label="Mobile" value={form.mobileNumber} onChange={set("mobileNumber")} />
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{user.email}</dd></div>
            <div><dt className="text-gray-500">Display Name</dt><dd className="font-medium">{user.displayName || "—"}</dd></div>
            <div><dt className="text-gray-500">Mobile</dt><dd className="font-medium">{user.mobileNumber || "—"}</dd></div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd><Badge color={user.isActive ? "green" : "red"}>{user.isActive ? "Active" : "Inactive"}</Badge></dd>
            </div>
          </dl>
        )}
      </Card>

      {/* Roles */}
      <Card
        title="Roles"
        actions={canEdit ? <Button size="sm" onClick={() => setShowRoleModal(true)}>Assign Role</Button> : undefined}
      >
        {userRoles.loading ? <Spinner className="h-5 w-5" /> : (
          <div className="flex flex-wrap gap-2">
            {(userRoles.data?.roles ?? []).length === 0 && <span className="text-sm text-gray-400">No roles assigned</span>}
            {(userRoles.data?.roles ?? []).map((r) => (
              <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                {r.name}
                {canEdit && (
                  <button onClick={() => handleRemoveRole(r.id)} className="rounded-full p-0.5 hover:bg-indigo-200">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Actions */}
      {(canEdit || canDelete) && (
        <Card title="Actions">
          <div className="flex flex-wrap gap-3">
            {canEdit && (
              <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>Reset Password</Button>
            )}
            {canDelete && (
              <Button variant={user.isActive ? "danger" : "primary"} onClick={handleToggleActive}>
                {user.isActive ? "Deactivate" : "Activate"}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Assign Role Modal */}
      <Modal open={showRoleModal} onClose={() => setShowRoleModal(false)} title="Assign Role">
        <div className="space-y-4">
          <select
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            <option value="">Select a role...</option>
            {(allRoles.data?.roles ?? []).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
            <Button onClick={handleAssignRole} disabled={!selectedRoleId}>Assign</Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Reset Password">
        <div className="space-y-4">
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button onClick={handleResetPassword}>Reset</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
