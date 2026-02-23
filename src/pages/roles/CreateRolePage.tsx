import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { rolesApi } from "../../api/roles";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";

export function CreateRolePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await rolesApi.create({ name, description: description || undefined });
      toast("Role created");
      navigate(`/roles/${role.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Create Role</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Create</Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/roles")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
