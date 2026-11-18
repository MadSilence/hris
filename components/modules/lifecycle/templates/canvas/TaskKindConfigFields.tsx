"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/desact/checkbox";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useDocumentCategories } from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import type { Material, ProcessType, Question, TaskKind } from "@/models/lifecycle";
import { MaterialsEditor } from "@/components/modules/lifecycle/shared/MaterialsEditor";
import { QuestionsEditor } from "@/components/modules/lifecycle/shared/QuestionsEditor";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDocumentTemplates } from "@/components/modules/signing/hooks/useDocumentsSection";
import type { DocumentTemplateDTO } from "@/api/modules/signing/dto";

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
  /** SIGN: the document template. */
  templateId?: string | null;
  disabled?: boolean;
  onChange: (patch: {
    attributeIds?: string[];
    categoryId?: string | null;
    materials?: Material[];
    questions?: Question[];
    templateId?: string | null;
  }) => void;
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

function KindFields({ idPrefix, kind, type, attributeIds, categoryId, templateId, disabled, onChange }: Props) {
  const t = useTranslations("lifecycle");
  // The attribute list is read through its sections: there is no flat `/attributes` list on either side of
  // the stack, and the hook that asked for one got a 404 (found by the live run).
  const { data: groups } = useAttributeGroups();
  const { data: categories } = useDocumentCategories();
  const attributes = (groups ?? []).flatMap((g) => g.attributes ?? [])
    .filter((a) => type !== "PREBOARDING" || !NOT_ON_PREBOARDING_PAGE.has(String(a.type)));

  if (kind === "FILL_FIELDS") {
    return (
      <div className="space-y-1.5">
        <RequiredLabel required>{t("kindConfig.fields")}</RequiredLabel>
        <div className="max-h-48 overflow-y-auto">
          {attributes.length === 0 && <p className="text-hint text-tertiary">{t("kindConfig.noFields")}</p>}
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
        <p className="text-hint text-tertiary">{t("kindConfig.fieldsHint")}</p>
      </div>
    );
  }

  if (kind === "DOCUMENT") {
    // No category: the person uploads a document — any — and it closes the task (owner, 2026-11-02).
    return (
      <p className="text-hint text-tertiary">{t("kindConfig.documentHint")}</p>
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
          {t("kindConfig.requiresFile")}
        </label>
        {requires && (
          <>
            <SearchableSelect
              id={`${idPrefix}-category`}
              aria-label={t("kindConfig.category")}
              options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
              value={categoryId || null}
              onChange={(v) => onChange({ categoryId: v ?? "" })}
              placeholder={t("kindConfig.categoryPlaceholder")}
              disabled={disabled}
            />
            {/* An empty select with nothing to say why left the author stuck (walk, SWEEP S11). */}
            {categories !== undefined && categories.length === 0 && (
              <p className="text-hint text-tertiary">{t("kindConfig.noCategories")}</p>
            )}
            <p className="text-hint text-tertiary">{t("kindConfig.fileHint")}</p>
          </>
        )}
      </div>
    );
  }

  if (kind === "SIGN") return <SignTemplateField idPrefix={idPrefix} templateId={templateId ?? null} disabled={disabled}
    onChange={(id) => onChange({ templateId: id })} />;

  if (kind === "ACKNOWLEDGE") {
    return (
      <p className="text-hint text-tertiary">{t("kindConfig.acknowledgeHint")}</p>
    );
  }

  return null;
}

/** "The person → Their manager": a template's signers in their order, for the hint under the Document field. */
export function useSignersText() {
  const t = useTranslations("lifecycle");
  return (template: Pick<DocumentTemplateDTO, "signers">) =>
    t("kindConfig.signers", {
      list: [...template.signers]
        .sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
        .map((s) => (s.label?.trim() ? s.label : t(`kindConfig.signerKind.${s.kind}`)))
        .join(" → "),
    });
}

/**
 * The Sign task's document (process-sign-task P01a, P01d): one template, the field its own search, each option with
 * who signs in grey; who signs is the template's, so nothing else is asked.
 */
export function SignTemplateField({ idPrefix, templateId, disabled, onChange, error }: {
  idPrefix: string;
  templateId: string | null;
  disabled?: boolean;
  onChange: (templateId: string | null) => void;
  error?: string | null;
}) {
  const t = useTranslations("lifecycle");
  const { data: templates, isLoading } = useDocumentTemplates();
  const signersText = useSignersText();
  const chosen = (templates ?? []).find((x) => x.id === templateId) ?? null;
  return (
    <div className="space-y-1.5">
      <RequiredLabel htmlFor={`${idPrefix}-template`} required>{t("kindConfig.document")}</RequiredLabel>
      <SearchableSelect
        id={`${idPrefix}-template`}
        options={(templates ?? [])
          .filter((x) => x.isActive || x.id === templateId)
          .map((x) => ({ value: x.id, label: x.name, hint: signersText(x) }))}
        value={templateId}
        onChange={onChange}
        placeholder={isLoading ? t("kindConfig.loadingTemplates") : t("kindConfig.pickDocument")}
        emptyLabel={templates && templates.length === 0 ? t("kindConfig.noTemplates") : t("kindConfig.noDocumentMatch")}
        clearable={false}
        disabled={disabled}
      />
      {error && <p className="text-hint text-status-declined-text">{error}</p>}
      {chosen && <p className="text-hint text-tertiary">{signersText(chosen)}</p>}
    </div>
  );
}
