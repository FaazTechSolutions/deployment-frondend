import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { KeyRound, Smartphone, Monitor } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <Card title="Account Information">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{user.email}</dd></div>
          <div><dt className="text-gray-500">Display Name</dt><dd className="font-medium">{user.displayName || "—"}</dd></div>
          <div><dt className="text-gray-500">Mobile</dt><dd className="font-medium">{user.mobileNumber || "—"}</dd></div>
          <div>
            <dt className="text-gray-500">MFA</dt>
            <dd><Badge color={user.mfaEnabled ? "green" : "gray"}>{user.mfaEnabled ? `Enabled (${user.mfaMethod})` : "Disabled"}</Badge></dd>
          </div>
          <div>
            <dt className="text-gray-500">Roles</dt>
            <dd className="flex flex-wrap gap-1">
              {(user.roles ?? []).map((r) => <Badge key={r} color="indigo">{r}</Badge>)}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/profile/change-password" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow">
          <KeyRound className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Change Password</span>
        </Link>
        <Link to="/profile/mfa" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow">
          <Smartphone className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">MFA Settings</span>
        </Link>
        <Link to="/profile/sessions" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow">
          <Monitor className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Active Sessions</span>
        </Link>
      </div>
    </div>
  );
}
