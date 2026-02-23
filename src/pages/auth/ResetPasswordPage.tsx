import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-indigo-600">Platform4x</h1>
          <p className="mt-1 text-sm text-gray-500">Set a new password</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {done ? (
            <div className="text-center">
              <p className="text-sm text-gray-600">Your password has been reset successfully.</p>
              <Link to="/login" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">Sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && <p className="text-sm text-red-600">Missing reset token. Please use the link from your email.</p>}
              <Input label="New Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Input label="Confirm Password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} disabled={!token} className="w-full">Reset Password</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
