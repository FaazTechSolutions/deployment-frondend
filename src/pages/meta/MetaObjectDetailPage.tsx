import { useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { metaApi, type MetaObject, type MetaField } from "../../api/meta";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import { FieldEditor } from "./FieldEditor";
import { formatDate } from "../../lib/utils";

export function MetaObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  const { data: obj, loading, error, reload } = useApi<MetaObject>(() => metaApi.get(id!), [id]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<MetaField[]>([]);
  const [saving, setSaving] = useState(false);

  function startEditing() {
    if (!obj) return;
    setName(obj.name);
    setDescription(obj.description || "");
    setFields([...obj.fields]);
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (fields.some((f) => !f.name.trim())) { toast("All fields must have a name", "error"); return; }
    setSaving(true);
    try {
      await metaApi.update(id!, { name, description: description || undefined, fields });
      toast("Meta object updated");
      setEditing(false);
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this meta object?")) return;
    try {
      await metaApi.delete(id!);
      toast("Meta object deleted");
      navigate("/meta");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  }

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!obj) return null;

  const canEdit = hasPermission("meta_objects:update");
  const canDelete = hasPermission("meta_objects:delete");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{obj.name}</h1>
        <Button variant="secondary" onClick={() => navigate("/meta")}>Back</Button>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <Card title="Details">
            <div className="space-y-4">
              <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </Card>
          <Card title="Fields">
            <FieldEditor fields={fields} onChange={setFields} />
          </Card>
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>Save</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <>
          <Card
            title="Details"
            actions={canEdit ? <Button variant="secondary" size="sm" onClick={startEditing}>Edit</Button> : undefined}
          >
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{obj.name}</dd></div>
              <div><dt className="text-gray-500">Type</dt><dd>{obj.type ? <Badge color="blue">{obj.type}</Badge> : "—"}</dd></div>
              <div><dt className="text-gray-500">Description</dt><dd className="font-medium">{obj.description || "—"}</dd></div>
              <div><dt className="text-gray-500">Modified</dt><dd className="font-medium">{formatDate(obj.modifiedAt)}</dd></div>
            </dl>
          </Card>

          <Card title={`Fields (${obj.fields.length})`}>
            {obj.fields.length === 0 ? (
              <p className="text-sm text-gray-400">No fields defined.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {obj.fields.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 text-sm">
                    <span className="font-medium text-gray-900">{f.name}</span>
                    <Badge color="gray">{f.type}</Badge>
                    {f.required && <Badge color="yellow">required</Badge>}
                    {f.label && <span className="text-gray-400">{f.label}</span>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {canDelete && (
            <Card title="Danger Zone">
              <Button variant="danger" onClick={handleDelete}>Delete Meta Object</Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
