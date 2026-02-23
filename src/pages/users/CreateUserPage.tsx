import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../../api/users";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";

export function CreateUserPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({ email: "", password: "", displayName: "", mobileNumber: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const user = await usersApi.create({
        email: form.email,
        password: form.password,
        displayName: form.displayName || undefined,
        mobileNumber: form.mobileNumber || undefined,
      });
      toast("User created successfully");
      navigate(`/users/${user.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={form.email} onChange={set("email")} />
          <Input label="Password" type="password" required value={form.password} onChange={set("password")} />
          <Input label="Display Name" value={form.displayName} onChange={set("displayName")} />
          <Input label="Mobile (E.164)" type="tel" placeholder="+1234567890" value={form.mobileNumber} onChange={set("mobileNumber")} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Create</Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/users")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
