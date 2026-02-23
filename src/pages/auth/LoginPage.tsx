import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginMfa } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // MFA state
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaTarget, setMfaTarget] = useState("");
  const [mfaMethod, setMfaMethod] = useState("");
  const [resending, setResending] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if ("mfaRequired" in res && res.mfaRequired) {
        setMfaStep(true);
        setMfaToken(res.mfaToken);
        setMfaTarget(res.mfaTarget);
        setMfaMethod(res.mfaMethod);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfa(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginMfa(mfaToken, mfaCode);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid MFA code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await authApi.resendMfa({ mfaToken });
      setMfaTarget(res.mfaTarget);
      toast("Verification code resent");
    } catch {
      toast("Failed to resend code", "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-indigo-600">Platform4x</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {!mfaStep ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">Sign in</Button>
            </form>
          ) : (
            <form onSubmit={handleMfa} className="space-y-4">
              <p className="text-sm text-gray-600">
                A verification code was sent via <strong>{mfaMethod}</strong> to <strong>{mfaTarget}</strong>.
              </p>
              <Input
                label="Verification Code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="000000"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">Verify</Button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full text-center text-sm text-indigo-600 hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <Link to="/forgot-password" className="text-indigo-600 hover:underline">Forgot password?</Link>
          {" · "}
          <Link to="/register" className="text-indigo-600 hover:underline">Create account</Link>
        </div>
      </div>
    </div>
  );
}
