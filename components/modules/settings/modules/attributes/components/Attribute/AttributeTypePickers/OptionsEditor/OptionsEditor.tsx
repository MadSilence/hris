"use client";

import React from "react";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { AttributeOption, AttributeType, isOptionsType } from "@/models/attribute";
import { PRESET_COLORS } from "@/models/colors";
import {
  ColorSwatchPicker
} from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/ColorSwatchPicker";
import { sortBySortOrder } from "../../../../hooks/utils/useReorderAction";
import { AttributeOptionUpsert } from "@/models/attribute/AttributeOptionUpsert";

type OptionsEditorProps = {
  type: AttributeType;
  options: AttributeOption[];
  onChange: (options: AttributeOptionUpsert[]) => void;
  disabled?: boolean;
};

function pickNextColor(current: AttributeOptionUpsert[]): string {
  const used = new Set(current.map((o) => o.color).filter(Boolean));
  const free = PRESET_COLORS.find((c) => !used.has(c));

  return free ?? PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
}

export const OptionsEditor: React.FC<OptionsEditorProps> = ({
  type,
  options,
  onChange,
  disabled = false,
}) => {
  const needsOptions = isOptionsType(type);

  const [local, setLocal] = React.useState<AttributeOptionUpsert[]>(
    sortBySortOrder(options).map((o) => ({
      id: o.id,
      value: o.value,
      color: o.color,
      sortOrder: o.sortOrder,
    })),
  );

  React.useEffect(() => {
    setLocal(
      sortBySortOrder(options).map((o) => ({
        id: o.id,
        value: o.value,
        color: o.color,
        sortOrder: o.sortOrder,
      })),
    );
  }, [options]);

  React.useEffect(() => {
    if (!needsOptions) return;

    if (local.length === 0) {
      const first: AttributeOptionUpsert = {
        value: "",
        color: PRESET_COLORS[0],
        sortOrder: 1,
      };

      setLocal([first]);
      onChange([first]);
    }
  }, [needsOptions]);

  const commit = (next: AttributeOptionUpsert[]) => {
    const reindex = next.map((o, i) => ({ ...o, sortOrder: i + 1 }));

    setLocal(reindex);
    onChange(reindex);
  };

  const addOption = () => {
    const nextColor = pickNextColor(local);

    const next: AttributeOptionUpsert = {
      value: `Option ${local.length + 1}`,
      color: nextColor,
      sortOrder: local.length + 1,
    };

    commit([...local, next]);
  };

  const updateOption = (index: number, patch: Partial<AttributeOptionUpsert>) => {
    const next = local.map((o, i) => (i === index ? { ...o, ...patch } : o));

    commit(next);
  };

  const removeOption = (index: number) => {
    const next = local.filter((_, i) => i !== index);

    commit(
      next.length === 0
        ? [{ value: "", color: PRESET_COLORS[0], sortOrder: 1 }]
        : next,
    );
  };

  if (!needsOptions) return null;

  return (
    <div className="space-y-2">
      <div className="-mx-1 max-h-64 space-y-2 overflow-y-auto px-1 py-1">
        {local.map((option, index) => (
          <div key={option.id ?? `new-${index}`} className="flex items-center gap-2">
            <Input
              placeholder={`Option ${index + 1}`}
              value={option.value}
              onChange={(e) =>
                updateOption(index, {
                  value: e.currentTarget.value,
                })
              }
              aria-label={`Option ${index + 1}`}
              disabled={disabled}
            />

            <ColorSwatchPicker
              value={option.color}
              onChange={(hex) => updateOption(index, { color: hex })}
              ariaLabel={`Color for option ${index + 1}`}
              disabled={disabled}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-brown-500 hover:text-destructive"
              onClick={() => removeOption(index)}
              aria-label={`Remove option ${index + 1}`}
              title="Remove option"
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4"/>
            </Button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        disabled={disabled}
        className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-brown-300 px-3 py-2 text-sm text-brown-600 hover:bg-brown-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4"/>
        Add option
      </button>
    </div>
  );
};
