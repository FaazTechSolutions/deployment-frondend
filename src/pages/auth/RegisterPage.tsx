import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", displayName: "", firstName: "", lastName: "", mobileNumber: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        displayName: form.displayName || undefined,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        mobileNumber: form.mobileNumber || undefined,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-indigo-600">Platform4x</h1>
          <p className="mt-1 text-sm text-gray-500">Create your account</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={form.firstName} onChange={set("firstName")} />
              <Input label="Last Name" value={form.lastName} onChange={set("lastName")} />
            </div>
            <Input label="Display Name" value={form.displayName} onChange={set("displayName")} />
            <Input label="Email" type="email" required value={form.email} onChange={set("email")} />
            <Input label="Mobile (E.164)" type="tel" placeholder="+1234567890" value={form.mobileNumber} onChange={set("mobileNumber")} />
            <Input label="Password" type="password" required value={form.password} onChange={set("password")} />
            <Input label="Confirm Password" type="password" required value={form.confirmPassword} onChange={set("confirmPassword")} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Create Account</Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
