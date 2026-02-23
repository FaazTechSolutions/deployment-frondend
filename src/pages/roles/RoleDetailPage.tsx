import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { rolesApi, type Role, type Permission } from "../../api/roles";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";

export function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  const { data: role, loading, error, reload } = useApi<Role>(() => rolesApi.get(id!), [id]);
  const perms = useApi<{ permissions: Permission[] }>(() => rolesApi.getPermissions(id!), [id]);
  const allPerms = useApi<{ permissions: Permission[] }>(() => rolesApi.getAllPermissions(), []);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [editingPerms, setEditingPerms] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => {
    if (perms.data) {
      setSelectedPerms(new Set(perms.data.permissions.map((p) => p.id)));
    }
  }, [perms.data]);

  function startEditing() {
    if (!role) return;
    setName(role.name);
    setDescription(role.description || "");
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await rolesApi.update(id!, { name, description: description || undefined });
      toast("Role updated");
      setEditing(false);
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this role?")) return;
    try {
      await rolesApi.delete(id!);
      toast("Role deleted");
      navigate("/roles");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Cannot delete", "error");
    }
  }

  function togglePerm(permId: string) {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId); else next.add(permId);
      return next;
    });
  }

  async function handleSavePerms() {
    setSavingPerms(true);
    try {
      await rolesApi.updatePermissions(id!, [...selectedPerms]);
      toast("Permissions updated");
      setEditingPerms(false);
      perms.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update permissions", "error");
    } finally {
      setSavingPerms(false);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!role) return null;

  const canEdit = hasPermission("roles:update") && !role.isSystem;
  const canDelete = hasPermission("roles:delete") && !role.isSystem;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Role: {role.name}</h1>
        <Button variant="secondary" onClick={() => navigate("/roles")}>Back</Button>
      </div>

      <Card
        title="Details"
        actions={canEdit && !editing ? <Button variant="secondary" size="sm" onClick={startEditing}>Edit</Button> : undefined}
      >
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{role.name}</dd></div>
            <div><dt className="text-gray-500">Description</dt><dd className="font-medium">{role.description || "—"}</dd></div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd><Badge color={role.isSystem ? "blue" : "gray"}>{role.isSystem ? "System" : "Custom"}</Badge></dd>
            </div>
          </dl>
        )}
      </Card>

      {/* Permissions */}
      <Card
        title="Permissions"
        actions={
          canEdit ? (
            editingPerms ? (
              <div className="flex gap-2">
                <Button size="sm" loading={savingPerms} onClick={handleSavePerms}>Save</Button>
                <Button size="sm" variant="secondary" onClick={() => { setEditingPerms(false); if (perms.data) setSelectedPerms(new Set(perms.data.permissions.map((p) => p.id))); }}>Cancel</Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setEditingPerms(true)}>Edit</Button>
            )
          ) : undefined
        }
      >
        {perms.loading || allPerms.loading ? <Spinner className="h-5 w-5" /> : (
          editingPerms ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(allPerms.data?.permissions ?? []).map((p) => (
                <label key={p.id} className="flex items-center gap-2 rounded-lg border border-gray-100 p-2 text-sm hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPerms.has(p.id)}
                    onChange={() => togglePerm(p.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium">{p.resource}:{p.action}</span>
                  {p.description && <span className="text-gray-400 text-xs">— {p.description}</span>}
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(perms.data?.permissions ?? []).length === 0 && <span className="text-sm text-gray-400">No permissions</span>}
              {(perms.data?.permissions ?? []).map((p) => (
                <Badge key={p.id} color="indigo">{p.resource}:{p.action}</Badge>
              ))}
            </div>
          )
        )}
      </Card>

      {canDelete && (
        <Card title="Danger Zone">
          <Button variant="danger" onClick={handleDelete}>Delete Role</Button>
        </Card>
      )}
    </div>
  );
}
