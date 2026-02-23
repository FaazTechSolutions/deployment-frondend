import { type MetaField } from "../../api/meta";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Plus, Trash2, GripVertical } from "lucide-react";

const FIELD_TYPES = ["string", "number", "boolean", "date", "text", "email", "url", "json"];

interface FieldEditorProps {
  fields: MetaField[];
  onChange: (fields: MetaField[]) => void;
}

export function FieldEditor({ fields, onChange }: FieldEditorProps) {
  function addField() {
    onChange([...fields, { name: "", type: "string", required: false, label: "" }]);
  }

  function removeField(idx: number) {
    onChange(fields.filter((_, i) => i !== idx));
  }

  function updateField(idx: number, patch: Partial<MetaField>) {
    onChange(fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  }

  function moveField(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Fields</p>
        <Button type="button" size="sm" variant="secondary" onClick={addField}>
          <Plus className="h-3.5 w-3.5" /> Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-400">No fields defined. Click "Add Field" to start.</p>
      )}

      {fields.map((field, idx) => (
        <div key={idx} className="flex items-start gap-2 rounded-lg border border-gray-200 p-3">
          <div className="flex flex-col gap-0.5 pt-2">
            <button type="button" onClick={() => moveField(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
            <Input
              placeholder="Field name"
              value={field.name}
              onChange={(e) => updateField(idx, { name: e.target.value })}
            />
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={field.type}
              onChange={(e) => updateField(idx, { type: e.target.value })}
            >
              {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Input
              placeholder="Label"
              value={field.label || ""}
              onChange={(e) => updateField(idx, { label: e.target.value })}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required ?? false}
                  onChange={(e) => updateField(idx, { required: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600"
                />
                Required
              </label>
              <button type="button" onClick={() => removeField(idx)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
