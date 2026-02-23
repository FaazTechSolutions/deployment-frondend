import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";

import { DashboardPage } from "./pages/dashboard/DashboardPage";

import { UsersPage } from "./pages/users/UsersPage";
import { CreateUserPage } from "./pages/users/CreateUserPage";
import { UserDetailPage } from "./pages/users/UserDetailPage";

import { RolesPage } from "./pages/roles/RolesPage";
import { CreateRolePage } from "./pages/roles/CreateRolePage";
import { RoleDetailPage } from "./pages/roles/RoleDetailPage";
import { PermissionsPage } from "./pages/roles/PermissionsPage";

import { MetaObjectsPage } from "./pages/meta/MetaObjectsPage";
import { CreateMetaObjectPage } from "./pages/meta/CreateMetaObjectPage";
import { MetaObjectDetailPage } from "./pages/meta/MetaObjectDetailPage";

import { ProfilePage } from "./pages/profile/ProfilePage";
import { ChangePasswordPage } from "./pages/profile/ChangePasswordPage";
import { MfaSettingsPage } from "./pages/profile/MfaSettingsPage";
import { SessionsPage } from "./pages/profile/SessionsPage";

export function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes with sidebar layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          {/* Users */}
          <Route element={<ProtectedRoute permission="users:read" />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
          </Route>
          <Route element={<ProtectedRoute permission="users:create" />}>
            <Route path="users/new" element={<CreateUserPage />} />
          </Route>

          {/* Roles */}
          <Route element={<ProtectedRoute permission="roles:read" />}>
            <Route path="roles" element={<RolesPage />} />
            <Route path="roles/permissions" element={<PermissionsPage />} />
            <Route path="roles/:id" element={<RoleDetailPage />} />
          </Route>
          <Route element={<ProtectedRoute permission="roles:create" />}>
            <Route path="roles/new" element={<CreateRolePage />} />
          </Route>

          {/* Meta Objects */}
          <Route element={<ProtectedRoute permission="meta_objects:read" />}>
            <Route path="meta" element={<MetaObjectsPage />} />
            <Route path="meta/:id" element={<MetaObjectDetailPage />} />
          </Route>
          <Route element={<ProtectedRoute permission="meta_objects:create" />}>
            <Route path="meta/new" element={<CreateMetaObjectPage />} />
          </Route>

          {/* Profile (no extra permissions) */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/change-password" element={<ChangePasswordPage />} />
          <Route path="profile/mfa" element={<MfaSettingsPage />} />
          <Route path="profile/sessions" element={<SessionsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
