"use client";

import React, { useId, useState } from "react";
import styles from "./AttributeRow.module.css";
import { Attribute } from "@/models/attribute/Attribute";
import { SortableApi } from "@/components/utils/SortableRow";
import ArrowUp from "@/public/icons/arrow-up.svg";
import ArrowDown from "@/public/icons/arrow-down.svg";
import Trash from "@/public/icons/trash.svg";
import Input from "@/components/ui/Input/Input";
import { AttributeOptions } from "@/components/modules/settings/modules/attributes/components/AttributeOptions";

export interface AttributeRowProps {
  attribute: Attribute;
  sortable: SortableApi;
  selectedId: string;
  onSelect: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onSave: (id: string, patch: Partial<Attribute>) => void;
  isSaving?: boolean;
}

export const AttributeRow: React.FC<AttributeRowProps> = ({
  attribute,
  sortable,
  selectedId,
  onSelect,
  onDeleteRequest,
  onSave,
  isSaving,
}) => {
  const detailsId = useId();
  const isPreset = !!attribute.system;
  const expanded = attribute.id === selectedId;
  const [draft, setDraft] = useState<Partial<Attribute>>({});
  const nameValue = (draft.name ?? attribute.name) || "";

  const applyPatch = (patch: Partial<Attribute>) => setDraft((d) => ({ ...d, ...patch }));
  const handleSave = () => {
    onSave(attribute.id, draft);
    setDraft({});
  };
  const handleCancel = () => setDraft({});

  const toggle = () => {
    if (expanded) onSelect("");
    else onSelect(attribute.id);
  };

  const onHeaderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div ref={sortable.setNodeRef} style={sortable.style} className={styles.item}>
      <div
        className={styles.rowHeader}
        onClick={toggle}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onKeyDown={onHeaderKeyDown}
      >
        <div className={styles.rowLeft}>
          <span
            className={styles.handle}
            {...sortable.attributes}
            {...(sortable.listeners ?? {})}
            aria-label="Drag to reorder"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            ⋮⋮
          </span>

          <button
            type="button"
            className={styles.arrowBtn}
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            {expanded ? <ArrowUp /> : <ArrowDown />}
          </button>

          <div className={styles.nameWrap} onClick={(e) => e.stopPropagation()}>
            {expanded && !isPreset ? (
              <Input
                className={styles.nameInput}
                value={nameValue}
                onChange={(e) => applyPatch({ name: (e.target as HTMLInputElement).value })}
                aria-label="Attribute name"
                disabled={isSaving}
              />
            ) : (
              <span className={styles.label} title={nameValue}>
                {nameValue}
              </span>
            )}
          </div>
        </div>

        <div className={styles.rowRight}>
          {isPreset ? (
            <span className={styles.presetPill}>Preset Attribute</span>
          ) : (
            expanded && (
              <button
                type="button"
                className={styles.trashBtn}
                aria-label="Delete attribute"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(attribute.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.stopPropagation();
                  }
                }}
                disabled={isSaving}
              >
                <Trash />
              </button>
            )
          )}
        </div>
      </div>

      {expanded && (
        <div id={detailsId} className={styles.rowDetailsWide}>
          <AttributeOptions
            attribute={{ ...attribute, ...(draft as any) } as Attribute}
            onChange={applyPatch}
            onSave={handleSave}
            onCancel={handleCancel}
            isPreset={isPreset}
          />
        </div>
      )}
    </div>
  );
};
