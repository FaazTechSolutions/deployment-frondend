import { useApi } from "../../hooks/useApi";
import { rolesApi, type Permission } from "../../api/roles";
import { Table } from "../../components/ui/Table";
import { Spinner } from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export function PermissionsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi<{ permissions: Permission[] }>(() => rolesApi.getAllPermissions(), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Permissions</h1>
        <Button variant="secondary" onClick={() => navigate("/roles")}>Back to Roles</Button>
      </div>

      {loading ? <Spinner /> : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : data ? (
        <Table
          keyField="id"
          data={data.permissions}
          columns={[
            { header: "Resource", accessor: "resource" },
            { header: "Action", accessor: "action" },
            { header: "Description", accessor: (p) => p.description || "—" },
          ]}
        />
      ) : null}
    </div>
  );
}
