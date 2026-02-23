import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Shield,
  Boxes,
  UserCircle,
  LogOut,
} from "lucide-react";
import { classNames } from "../../lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  classNames(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-indigo-50 text-indigo-700"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  );

export function Sidebar() {
  const { user, hasPermission, logout } = useAuth();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <span className="text-lg font-bold text-indigo-600">Platform4x</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavLink to="/" end className={navLinkClass}>
          <LayoutDashboard className="h-5 w-5" /> Dashboard
        </NavLink>

        {hasPermission("users:read") && (
          <NavLink to="/users" className={navLinkClass}>
            <Users className="h-5 w-5" /> Users
          </NavLink>
        )}

        {hasPermission("roles:read") && (
          <NavLink to="/roles" className={navLinkClass}>
            <Shield className="h-5 w-5" /> Roles
          </NavLink>
        )}

        {hasPermission("meta_objects:read") && (
          <NavLink to="/meta" className={navLinkClass}>
            <Boxes className="h-5 w-5" /> Meta Objects
          </NavLink>
        )}

        <div className="mt-4! border-t border-gray-200 pt-4">
          <NavLink to="/profile" className={navLinkClass}>
            <UserCircle className="h-5 w-5" /> Profile
          </NavLink>
        </div>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-200 p-3">
        <div className="mb-2 truncate px-3 text-xs text-gray-500">{user?.email}</div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
