"use client";

import React from "react";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { AttributeOption, AttributeType, isOptionsType } from "@/models/attribute";
import { TagColorPicker } from "@/components/ui/TagColorPicker";
import { nextTagColor, TAG_COLOR_SEQUENCE } from "@/lib/theme/tags";
import { sortBySortOrder } from "../../../../hooks/utils/useReorderAction";
import { AttributeOptionUpsert } from "@/models/attribute/AttributeOptionUpsert";

type OptionsEditorProps = {
  type: AttributeType;
  options: AttributeOption[];
  onChange: (options: AttributeOptionUpsert[]) => void;
  disabled?: boolean;
};

/** A new option takes the next tag colour nobody uses yet (SPEC § 4.7). */
const pickNextColor = (current: AttributeOptionUpsert[]): string => nextTagColor(current.map((o) => o.color));

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
        color: TAG_COLOR_SEQUENCE[0],
        sortOrder: 1,
      };

      setLocal([first]);
      onChange([first]);
    }
    // Seeds the first row when the type starts needing options. Depending on local.length or
    // onChange would re-seed (or loop) as the user edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        ? [{ value: "", color: TAG_COLOR_SEQUENCE[0], sortOrder: 1 }]
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

            <TagColorPicker
              value={option.color}
              onChange={(color) => updateOption(index, { color })}
              ariaLabel={`Color for option ${index + 1}`}
              disabled={disabled}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon" className="shrink-0 text-tertiary hover:text-danger-text"
              onClick={() => removeOption(index)}
              aria-label={`Remove option ${index + 1}`}
              title="Remove option"
              disabled={disabled}
            >
              <Icon icon={Delete02Icon} size="sm" />
            </Button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        disabled={disabled}
        className="flex w-full items-center gap-1.5 rounded-control border border-dashed border-field px-3 py-2 text-body text-secondary hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon icon={Add01Icon} size="sm" />
        Add option
      </button>
    </div>
  );
};
