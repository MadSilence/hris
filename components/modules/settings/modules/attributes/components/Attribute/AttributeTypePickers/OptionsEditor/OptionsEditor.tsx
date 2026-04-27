"use client";

import React from "react";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import Trash from "@/public/icons/trash.svg";
import styles from "./OptionsEditor.module.css";
import { AttributeOption, AttributeType, isOptionsType } from "@/models/attribute";
import { SOFT_PALETTE } from "@/models/colors";
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
  const free = SOFT_PALETTE.find((c) => !used.has(c));

  return free ?? SOFT_PALETTE[Math.floor(Math.random() * SOFT_PALETTE.length)];
}

export const OptionsEditor: React.FC<OptionsEditorProps> = ({
  type,
  options,
  onChange,
  disabled = false,
}) => {
  const needsOptions = isOptionsType(type) || type === AttributeType.STATUS;

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
        color: SOFT_PALETTE[0],
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
        ? [{ value: "", color: SOFT_PALETTE[0], sortOrder: 1 }]
        : next,
    );
  };

  if (!needsOptions) return null;

  return (
    <div className={styles.optionsBlock}>
      <div className={styles.optionsList}>
        {local.map((option, index) => (
          <div key={option.id ?? `new-${index}`} className={styles.optionRow}>
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

            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => removeOption(index)}
              aria-label={`Remove option ${index + 1}`}
              title="Remove option"
              disabled={disabled}
            >
              <Trash className={styles.trashIcon}/>
            </button>
          </div>
        ))}
      </div>

      <div className={styles.addWrap}>
        <Button variant="ghost" type="button" onClick={addOption} disabled={disabled}>
          Add option
        </Button>
      </div>
    </div>
  );
};
