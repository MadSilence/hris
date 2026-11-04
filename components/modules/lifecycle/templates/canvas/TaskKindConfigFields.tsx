"use client";

import React from "react";
import { Checkbox } from "@/components/desact/checkbox";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useDocumentCategories } from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import type { Material, ProcessType, Question, TaskKind } from "@/models/lifecycle";
import { MaterialsEditor } from "@/components/modules/lifecycle/shared/MaterialsEditor";
import { QuestionsEditor } from "@/components/modules/lifecycle/shared/QuestionsEditor";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

/** Field types the preboarding page cannot show — the backend refuses them there too. */
const NOT_ON_PREBOARDING_PAGE = new Set(["PERSON", "REFERENCE", "OBJECT", "ADDRESS", "MONEY"]);

type Props = {
  idPrefix: string;
  kind: TaskKind;
  type: ProcessType;
  attributeIds: string[];
  categoryId: string | null;
  materials: Material[];
  questions: Question[];
  disabled?: boolean;
  onChange: (patch: { attributeIds?: string[]; categoryId?: string | null; materials?: Material[]; questions?: Question[] }) => void;
};

/**
 * What a task of each kind needs: which fields, which document category, whether a to-do requires a file,
 * the questions of a questionnaire — and the material any task may carry (DECISIONS.md § "Lifecycle tasks").
 * Shared by the template's side panel and a task added to a running process.
 */
export function TaskKindConfigFields(props: Props) {
  const { idPrefix, kind, materials, questions, disabled, onChange } = props;
  return (
    <div className="space-y-5">
      <KindFields {...props} />
      {kind === "QUESTIONNAIRE" && (
        <QuestionsEditor idPrefix={idPrefix} questions={questions} disabled={disabled} onChange={(q) => onChange({ questions: q })} />
      )}
      <MaterialsEditor idPrefix={idPrefix} materials={materials} disabled={disabled} required={kind === "ACKNOWLEDGE"}
        onChange={(m) => onChange({ materials: m })} />
    </div>
  );
}

function KindFields({ idPrefix, kind, type, attributeIds, categoryId, disabled, onChange }: Props) {
  // The attribute list is read through its sections: there is no flat `/attributes` list on either side of
  // the stack, and the hook that asked for one got a 404 (found by the live run).
  const { data: groups } = useAttributeGroups();
  const { data: categories } = useDocumentCategories();
  const attributes = (groups ?? []).flatMap((g) => g.attributes ?? [])
    .filter((a) => type !== "PREBOARDING" || !NOT_ON_PREBOARDING_PAGE.has(String(a.type)));

  if (kind === "FILL_FIELDS") {
    return (
      <div className="space-y-1.5">
        <RequiredLabel required>Fields</RequiredLabel>
        <div className="max-h-48 overflow-y-auto">
          {attributes.length === 0 && <p className="text-hint text-tertiary">There are no fields to ask for.</p>}
          {attributes.map((a) => (
            <label key={a.id} className="flex items-center gap-2 py-0.5 text-body">
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
        <p className="text-hint text-tertiary">Closes by itself once every field holds a value.</p>
      </div>
    );
  }

  if (kind === "DOCUMENT") {
    // No category: the person uploads a document — any — and it closes the task (owner, 2026-11-02).
    return (
      <p className="text-hint text-tertiary">
        The person uploads a file here. It goes into their Documents and closes the task.
      </p>
    );
  }

  if (kind === "TODO") {
    const requires = categoryId !== null;
    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-body">
          <Checkbox
            checked={requires}
            disabled={disabled}
            onCheckedChange={(on) => onChange({ categoryId: on ? (categories ?? [])[0]?.id ?? "" : null })}
          />
          Requires a file
        </label>
        {requires && (
          <>
            <SearchableSelect
              id={`${idPrefix}-category`}
              aria-label="Category of the file"
              options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
              value={categoryId || null}
              onChange={(v) => onChange({ categoryId: v ?? "" })}
              placeholder="Select a category…"
              disabled={disabled}
            />
            {/* An empty select with nothing to say why left the author stuck (walk, SWEEP S11). */}
            {categories !== undefined && categories.length === 0 && (
              <p className="text-hint text-tertiary">
                No document categories yet — add them in Settings → People → Documents.
              </p>
            )}
            <p className="text-hint text-tertiary">
              Ticked with the file attached — a signed form, a receipt. It goes into the person&apos;s Documents.
            </p>
          </>
        )}
      </div>
    );
  }

  if (kind === "ACKNOWLEDGE") {
    return (
      <p className="text-hint text-tertiary">
        The person reads what is attached and presses I Have Read It; the moment is recorded. Only they can do it.
      </p>
    );
  }

  return null;
}
