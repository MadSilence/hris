"use client";

import { FC } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { AttributeType } from "@/models/attribute";
import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import {
  ObjectFieldDef,
  ObjectSubfieldType,
  OBJECT_SUBFIELD_TYPES,
  keyFromLabel,
} from "@/models/attribute/objectFields";

type Props = {
  fields: ObjectFieldDef[];
  onChange: (fields: ObjectFieldDef[]) => void;
  disabled?: boolean;
};

/** Editor for the sub-schema of a repeatable-object attribute (its sub-fields). */
export const ObjectFieldsEditor: FC<Props> = ({ fields, onChange, disabled }) => {
  const patch = (index: number, next: Partial<ObjectFieldDef>) =>
    onChange(fields.map((f, i) => (i === index ? { ...f, ...next } : f)));

  const addField = () => {
    const label = `Field ${fields.length + 1}`;
    onChange([
      ...fields,
      {
        key: keyFromLabel(label, fields.map((f) => f.key)),
        label,
        type: AttributeType.TEXT,
        sortOrder: fields.length,
      },
    ]);
  };

  const removeField = (index: number) => onChange(fields.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <Label>Sub-fields</Label>
      <p className="text-xs text-muted-foreground">
        The fields of each record (e.g. Institution, Degree, Year).
      </p>

      {fields.length === 0 && (
        <p className="rounded-lg border border-dashed border-brown-200 px-4 py-6 text-center text-sm text-muted-foreground">
          No sub-fields yet. Add at least one.
        </p>
      )}

      {fields.length > 0 && (
        <div className="space-y-2">
          {/* Column headers once, not above every row — repeating them made each row a different
              height than its neighbours and forced a margin hack on the delete button. */}
          <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <span className="flex-1">Label</span>
            <span className="w-36">Type</span>
            <span className="w-9" aria-hidden />
          </div>

          <div className="-mx-1 max-h-56 space-y-2 overflow-y-auto px-1 py-1">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={field.label}
                  disabled={disabled}
                  placeholder="e.g. Institution"
                  aria-label={`Sub-field ${index + 1} label`}
                  onChange={(e) => patch(index, { label: e.currentTarget.value })}
                />

                <div className="w-36">
                  <Select
                    value={field.type}
                    disabled={disabled}
                    onValueChange={(v) => patch(index, { type: v as ObjectSubfieldType })}
                  >
                    <SelectTrigger aria-label={`Sub-field ${index + 1} type`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OBJECT_SUBFIELD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {getAttributeTypeLabel(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-brown-500 hover:text-destructive"
                  onClick={() => removeField(index)}
                  disabled={disabled}
                  aria-label={`Remove sub-field ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={addField}
        disabled={disabled}
        className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-brown-300 px-3 py-2 text-sm text-brown-600 hover:bg-brown-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Add sub-field
      </button>
    </div>
  );
};
