import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { metaApi, type MetaField } from "../../api/meta";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";
import { FieldEditor } from "./FieldEditor";

export function CreateMetaObjectPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [fields, setFields] = useState<MetaField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (fields.some((f) => !f.name.trim())) { setError("All fields must have a name"); return; }
    setLoading(true);
    try {
      const obj = await metaApi.create({ name, description: description || undefined, type: type || undefined, fields });
      toast("Meta object created");
      navigate(`/meta/${obj.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Create Meta Object</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <div className="space-y-4">
            <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input label="Type" placeholder="e.g. entity, form, report" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
        </Card>

        <Card>
          <FieldEditor fields={fields} onChange={setFields} />
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" loading={loading}>Create</Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/meta")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
