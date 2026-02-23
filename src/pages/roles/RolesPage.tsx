import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { rolesApi, type Role } from "../../api/roles";
import { useAuth } from "../../context/AuthContext";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Plus, KeyRound } from "lucide-react";

export function RolesPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data, loading, error } = useApi<{ roles: Role[] }>(() => rolesApi.list(), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/roles/permissions")}>
            <KeyRound className="h-4 w-4" /> All Permissions
          </Button>
          {hasPermission("roles:create") && (
            <Button onClick={() => navigate("/roles/new")}>
              <Plus className="h-4 w-4" /> New Role
            </Button>
          )}
        </div>
      </div>

      {loading ? <Spinner /> : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : data ? (
        <Table
          keyField="id"
          data={data.roles}
          onRowClick={(r) => navigate(`/roles/${r.id}`)}
          columns={[
            { header: "Name", accessor: "name" },
            { header: "Description", accessor: (r) => r.description || "—" },
            {
              header: "Type",
              accessor: (r) => <Badge color={r.isSystem ? "blue" : "gray"}>{r.isSystem ? "System" : "Custom"}</Badge>,
            },
          ]}
        />
      ) : null}
    </div>
  );
}
