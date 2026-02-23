import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../ui/Spinner";

interface ProtectedRouteProps {
  permission?: string;
}

export function ProtectedRoute({ permission }: ProtectedRouteProps) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <p className="text-lg font-semibold">Access Denied</p>
        <p className="text-sm">You do not have permission to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
}
