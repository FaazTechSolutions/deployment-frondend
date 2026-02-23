import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onChange: (offset: number) => void;
}

export function Pagination({ total, limit, offset, onChange }: PaginationProps) {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
      <p className="text-sm text-gray-500">
        Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(Math.max(0, offset - limit))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(offset + limit)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
