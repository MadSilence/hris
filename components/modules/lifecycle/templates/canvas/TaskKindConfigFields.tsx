"use client";

import React from "react";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useDocumentCategories } from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import type { ProcessType, TaskKind } from "@/models/lifecycle";

/** Field types the preboarding page cannot show — the backend refuses them there too. */
const NOT_ON_PREBOARDING_PAGE = new Set(["PERSON", "REFERENCE", "OBJECT", "ADDRESS", "MONEY"]);

type Props = {
  idPrefix: string;
  kind: TaskKind;
  type: ProcessType;
  attributeIds: string[];
  categoryId: string | null;
  disabled?: boolean;
  onChange: (patch: { attributeIds?: string[]; categoryId?: string | null }) => void;
};

/**
 * What a "Fill In Fields" or "Upload Document" task needs: which fields, which document category. The
 * pickers the template dialog had, moved here when the editor became a canvas.
 */
export function TaskKindConfigFields({ idPrefix, kind, type, attributeIds, categoryId, disabled, onChange }: Props) {
  // The attribute list is read through its sections: there is no flat `/attributes` list on either side of
  // the stack, and the hook that asked for one got a 404 (found by the live run).
  const { data: groups } = useAttributeGroups();
  const { data: categories, isLoading: isLoadingCategories } = useDocumentCategories();
  const attributes = (groups ?? []).flatMap((g) => g.attributes ?? [])
    .filter((a) => type !== "PREBOARDING" || !NOT_ON_PREBOARDING_PAGE.has(String(a.type)));

  if (kind === "FILL_FIELDS") {
    return (
      <div className="space-y-1.5">
        <RequiredLabel required>Fields</RequiredLabel>
        <div className="max-h-40 overflow-y-auto rounded-md border border-brown-200 p-2">
          {attributes.length === 0 && <p className="text-xs text-muted-foreground">There are no fields to ask for.</p>}
          {attributes.map((a) => (
            <label key={a.id} className="flex items-center gap-2 py-0.5 text-sm">
              <Checkbox
                checked={attributeIds.includes(a.id)}
                disabled={disabled}
                onCheckedChange={(checked) => onChange({
                  attributeIds: checked ? [...attributeIds, a.id] : attributeIds.filter((id) => id !== a.id),
                })}
              />
              {a.name}
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Closes by itself once every field holds a value.</p>
      </div>
    );
  }

  if (kind === "DOCUMENT") {
    return (
      <div className="space-y-1.5">
        <RequiredLabel htmlFor={`${idPrefix}-category`} required>Document Category</RequiredLabel>
        <Select value={categoryId ?? ""} onValueChange={(v) => onChange({ categoryId: v || null })} disabled={disabled}>
          <SelectTrigger id={`${idPrefix}-category`}><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            {(categories ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {/* An empty select with nothing to say why left the author stuck (walk, SWEEP S11). Only once the
            list has come back, so a slow read does not claim there are none. */}
        {!isLoadingCategories && (categories ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground">
            No document categories yet — add them in Settings → People → Documents.
          </p>
        )}
        <p className="text-xs text-muted-foreground">Closes by itself once a file of this category is uploaded.</p>
      </div>
    );
  }

  return null;
}
