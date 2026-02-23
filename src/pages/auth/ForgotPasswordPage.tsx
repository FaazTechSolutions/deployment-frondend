import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-indigo-600">Platform4x</h1>
          <p className="mt-1 text-sm text-gray-500">Reset your password</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                If an account exists for <strong>{email}</strong>, you will receive a password reset email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/login" className="text-indigo-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
