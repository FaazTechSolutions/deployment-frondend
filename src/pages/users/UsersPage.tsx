import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { usersApi, type PaginatedUsers } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import { Spinner } from "../../components/ui/Spinner";
import { Plus } from "lucide-react";

const PAGE_SIZE = 20;

export function UsersPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [offset, setOffset] = useState(0);

  const { data, loading, error } = useApi<PaginatedUsers>(
    () => usersApi.list({ limit: PAGE_SIZE, offset }),
    [offset],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        {hasPermission("users:create") && (
          <Button onClick={() => navigate("/users/new")}>
            <Plus className="h-4 w-4" /> New User
          </Button>
        )}
      </div>

      {loading ? <Spinner /> : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : data ? (
        <>
          <Table
            keyField="id"
            data={data.users}
            onRowClick={(u) => navigate(`/users/${u.id}`)}
            columns={[
              { header: "Email", accessor: "email" },
              { header: "Display Name", accessor: (u) => u.displayName || "—" },
              {
                header: "Status",
                accessor: (u) => <Badge color={u.isActive ? "green" : "red"}>{u.isActive ? "Active" : "Inactive"}</Badge>,
              },
              {
                header: "Roles",
                accessor: (u) =>
                  (u.roles ?? []).length > 0
                    ? (u.roles ?? []).map((r) => <Badge key={r} color="indigo">{r}</Badge>)
                    : <span className="text-gray-400">None</span>,
              },
            ]}
          />
          <Pagination
            total={data.pagination.total}
            limit={data.pagination.limit}
            offset={data.pagination.offset}
            onChange={setOffset}
          />
        </>
      ) : null}
    </div>
  );
}
