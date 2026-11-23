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
import { Combobox } from "@/components/ui/Combobox";
import { FieldError } from "@/components/desact/field-error";
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
      {/* A Sign task's material is its document (P01a): the block is not asked, unless the task already carries some. */}
      {(kind !== "SIGN" || materials.length > 0) && (
        <MaterialsEditor idPrefix={idPrefix} materials={materials} disabled={disabled} required={kind === "ACKNOWLEDGE"}
          onChange={(m) => onChange({ materials: m })} />
      )}
    </div>
  );
}

function KindFields({ idPrefix, kind, type, attributeIds, categoryId, templateId, disabled, onChange }: Props) {
  const t = useTranslations("lifecycle");
  // The attribute list is read through its sections: there is no flat `/attributes` list on either side of
  // the stack, and the hook that asked for one got a 404 (found by the live run).
  const { data: groups } = useAttributeGroups();
  const { data: allCategories } = useDocumentCategories();
  // A category deleted with "keep" is picked by nobody again (AQ-19) — but one already chosen stays readable.
  const categories = allCategories?.filter((c) => c.isActive || c.id === categoryId);
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

/**
 * Who signs a template, in its steps (process-sign-task P01a, P01d): "The person, then their manager" in a dropdown
 * option, and "The person signs, then their manager." under the chosen one. People of one step are joined by "and".
 */
export function useSignersText() {
  const t = useTranslations("lifecycle");
  const stepsOf = (template: Pick<DocumentTemplateDTO, "signers">, first: "signerKind" | "signerKindFirst") => {
    const byOrder = new Map<number, string[]>();
    const sorted = [...template.signers].sort((a, b) => (a.order ?? 1) - (b.order ?? 1));
    sorted.forEach((s, i) => {
      const order = s.order ?? 1;
      const head = i === 0 || order === (sorted[0].order ?? 1);
      const form = head ? first : "signerKindMid";
      const name = s.label?.trim() ? s.label : t(`kindConfig.${form}.${s.kind}`);
      byOrder.set(order, [...(byOrder.get(order) ?? []), name]);
    });
    return [...byOrder.values()].map((names) => names.join(t("kindConfig.andJoin")));
  };
  return Object.assign(
    (template: Pick<DocumentTemplateDTO, "signers">) => stepsOf(template, "signerKind").join(t("kindConfig.thenJoin")),
    {
      sentence: (template: Pick<DocumentTemplateDTO, "signers">) => {
        const [first, ...rest] = stepsOf(template, "signerKindFirst");
        if (!first) return "";
        return rest.length
          ? t("kindConfig.signsThen", { first, rest: rest.join(t("kindConfig.thenJoin")) })
          : t("kindConfig.signsSentence", { first });
      },
    },
  );
}

/**
 * The Sign task's document (process-sign-task P01a, P01d, P01e): one template, the field its own search, each option
 * with who signs in grey; who signs is the template's, so nothing else is asked. With no templates yet the list says
 * so (P01e); its "Open Document templates" link waits for the templates editor's screen and is not shown.
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
  const none = templates !== undefined && templates.filter((x) => x.isActive).length === 0;
  return (
    <div className="space-y-1.5">
      <RequiredLabel htmlFor={`${idPrefix}-template`} required>{t("kindConfig.document")}</RequiredLabel>
      <Combobox
        id={`${idPrefix}-template`}
        options={(templates ?? [])
          .filter((x) => x.isActive || x.id === templateId)
          .map((x) => ({ value: x.id, label: x.name, hint: signersText(x) }))}
        value={templateId}
        onChange={onChange}
        placeholder={isLoading ? t("kindConfig.loadingTemplates") : t("kindConfig.pickDocument")}
        emptyLabel={t("kindConfig.noDocumentMatch")}
        listState={none ? (
          <div className="flex flex-col gap-0.5 px-2.5 py-2">
            <span className="text-body font-medium text-primary">{t("kindConfig.noTemplatesTitle")}</span>
            <span className="text-hint text-tertiary">{t("kindConfig.noTemplatesBody")}</span>
          </div>
        ) : undefined}
        clearable={false}
        disabled={disabled}
        invalid={Boolean(error)}
      />
      <FieldError>{error}</FieldError>
      {chosen && !error && <p className="text-hint text-tertiary">{signersText.sentence(chosen)}</p>}
    </div>
  );
}
