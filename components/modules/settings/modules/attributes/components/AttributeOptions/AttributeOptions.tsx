"use client";

import React from "react";
import styles from "./AttributeOptions.module.css";
import { AttributeOption, AttributeOptionUpsert, AttributeType } from "@/models/attribute";
import { Attribute } from "@/models/attribute/Attribute";
import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import { Button } from "@/public/desact/src/components/ui/button";
import { OptionsEditor } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/OptionsEditor";
import { SOFT_PALETTE } from "@/models/colors";
import { sortBySortOrder } from "../../hooks/utils/useReorderAction";

interface AttributeOptionsProps {
  attribute: Attribute;
  onChange: (patch: Partial<Attribute>) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isPreset?: boolean;
}

function pickNextColor(existing: string[]): string {
  const used = new Set(existing.filter(Boolean));
  const free = SOFT_PALETTE.find((c) => !used.has(c));
  return free ?? SOFT_PALETTE[Math.floor(Math.random() * SOFT_PALETTE.length)];
}

export const AttributeOptions: React.FC<AttributeOptionsProps> = ({
  attribute,
  onChange,
  onSave,
  onCancel,
  isPreset = false,
}) => {
  const [localType, setLocalType] = React.useState<AttributeType>(attribute.type as AttributeType);
  const [uniqueId, setUniqueId] = React.useState<boolean>((attribute as any).uniqueId ?? false);
  const [hideYear, setHideYear] = React.useState<boolean>((attribute as any).dateHideYear ?? false);
  const [editorOptions, setEditorOptions] = React.useState<AttributeOptionUpsert[]>([]);

  React.useEffect(() => {
    const raw = Array.isArray((attribute as any).options) ? (attribute as any).options : [];
    const upsert = raw
      .slice()
      .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((o: any): AttributeOptionUpsert => ({
        id: o.id,
        value: o.value ?? "",
        color: o.color ?? SOFT_PALETTE[0],
        sortOrder: o.sortOrder ?? 0,
      }));

    setEditorOptions(upsert);
  }, [attribute]);

  const initialOptions = React.useMemo<AttributeOption[]>(
    () => sortBySortOrder(Array.isArray((attribute as any).options) ? (attribute as any).options : []),
    [attribute]
  );

  const [options, setOptions] = React.useState<AttributeOption[]>(initialOptions);

  React.useEffect(() => {
    setLocalType(attribute.type as AttributeType);
  }, [attribute.type]);

  React.useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const needsOptions = (t: AttributeType) =>
    [AttributeType.SELECT, AttributeType.MULTI_SELECT, AttributeType.STATUS].includes(t);

  React.useEffect(() => {
    if (needsOptions(localType) && options.length === 0) {
      const nextColor = pickNextColor([]);

      setOptions([
        {
          id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9),
          value: "",
          color: nextColor,
          sortOrder: 1,
          createdAt: "",
          createdBy: "",
          updatedAt: "",
          updatedBy: "",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localType]);

  const onTypeChange = (t: AttributeType) => {
    setLocalType(t);
    onChange({ type: t });
  };

  const save = () => {
    const patch: any = {};

    if (localType === AttributeType.DATE) patch.dateHideYear = hideYear;
    if (localType === AttributeType.TEXT) patch.uniqueId = uniqueId;

    if (needsOptions(localType)) {
      patch.options = editorOptions.map((o) => ({
        ...(o.id ? { id: o.id } : {}),
        value: o.value,
        color: o.color,
        sortOrder: o.sortOrder,
      }));
    }

    onChange(patch);
    onSave?.();
  };

  const cancel = () => {
    setLocalType(attribute.type as AttributeType);
    setUniqueId((attribute as any).uniqueId ?? false);
    setHideYear((attribute as any).dateHideYear ?? false);
    setOptions(initialOptions);
    onCancel?.();
  };

  const allTypes = [
    AttributeType.TEXT,
    AttributeType.SELECT,
    AttributeType.STATUS,
    AttributeType.PERSON,
    AttributeType.CHECKBOX,
    AttributeType.NUMBER,
    AttributeType.MULTI_SELECT,
    AttributeType.DATE,
    AttributeType.EMAIL,
    AttributeType.URL,
  ];

  return (
    <div className={styles.options}>
      <div className={styles.fieldRow}>
        <select
          className={`${styles.select} ${isPreset ? styles.selectDisabled : ""}`}
          value={localType}
          onChange={(e) => onTypeChange(e.target.value as AttributeType)}
          disabled={isPreset}
          aria-disabled={isPreset || undefined}
          tabIndex={isPreset ? -1 : 0}
        >
          {allTypes.map((t) => (
            <option key={t} value={t}>
              {getAttributeTypeLabel(t)}
            </option>
          ))}
        </select>
      </div>

      {needsOptions(localType) && (
        <OptionsEditor
          disabled={isPreset}
          type={localType}
          options={(attribute as any).options ?? []}
          onChange={setEditorOptions}
        />
      )}

      {localType === AttributeType.DATE && (
        <div className={styles.fieldRow}>
          <label className={styles.fieldLabel}>Hide year</label>
          <input
            type="checkbox"
            checked={hideYear}
            onChange={(e) => setHideYear(e.target.checked)}
            disabled={isPreset}
          />
        </div>
      )}

      {localType === AttributeType.TEXT && (
        <div className={styles.fieldRow}>
          <label className={styles.fieldLabel}>Unique Id</label>
          <input
            type="checkbox"
            checked={uniqueId}
            onChange={(e) => setUniqueId(e.target.checked)}
            disabled={isPreset}
          />
        </div>
      )}

      <div className={styles.actions}>
        <Button onClick={save}>Save</Button>
        <Button variant="secondary" onClick={cancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
