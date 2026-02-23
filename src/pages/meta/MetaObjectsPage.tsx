import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { metaApi, type MetaObject } from "../../api/meta";
import { useAuth } from "../../context/AuthContext";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Plus } from "lucide-react";
import { formatDate } from "../../lib/utils";

export function MetaObjectsPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data, loading, error } = useApi<MetaObject[]>(() => metaApi.list(), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meta Objects</h1>
        {hasPermission("meta_objects:create") && (
          <Button onClick={() => navigate("/meta/new")}>
            <Plus className="h-4 w-4" /> New Object
          </Button>
        )}
      </div>

      {loading ? <Spinner /> : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : data ? (
        <Table
          keyField="id"
          data={data}
          onRowClick={(o) => navigate(`/meta/${o.id}`)}
          columns={[
            { header: "Name", accessor: "name" },
            { header: "Type", accessor: (o) => o.type ? <Badge color="blue">{o.type}</Badge> : "—" },
            { header: "Fields", accessor: (o) => String(o.fields.length) },
            { header: "Modified", accessor: (o) => formatDate(o.modifiedAt) },
          ]}
        />
      ) : null}
    </div>
  );
}
