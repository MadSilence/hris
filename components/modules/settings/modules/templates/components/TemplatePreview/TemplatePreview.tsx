"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon, ArrowRight01Icon, ShieldAlertIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Badge } from "@/components/desact/badge";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Skeleton } from "@/components/desact/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { messageForCode } from "@/lib/errors/errorMessages";
import type {
  TemplateChoicesRequest,
  TemplateClashChoice,
  TemplateGrantDTO,
  TemplateItemChoice,
  TemplateItemDTO,
  TemplateOutcome,
  TemplatePartDTO,
  TemplateRecordedItem,
} from "@/api/modules/templates/dto";
import {
  useApplyTemplate,
  useTemplateApplication,
  useTemplatePreview,
} from "@/components/modules/settings/modules/templates/hooks";
import { FieldError } from "@/components/desact/field-error";
import { InlineAlert } from "@/components/desact/alert";
import { AttributeType } from "@/models/attribute/AttributeType";
import { attributeTypeLabelKey } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils/attributeTypeUtils";

type Translator = ReturnType<typeof useTranslations<"settings">>;

const BACK = "/settings/general/templates";

/** The preview's outcomes on the shared chip (STATUS_AND_BADGES.md § 1): the mapping is all a caller writes. */
const OUTCOME = {
  NEW: { status: "scheduled", label: "templates.outcome.new" },
  EXISTING: { status: "inactive", label: "templates.outcome.existing" },
  CLASH: { status: "pending", label: "templates.outcome.clash" },
  DROPPED: { status: "archived", label: "templates.outcome.dropped" },
} as const satisfies Record<TemplateOutcome, { status: StatusTone; label: string }>;

type Choices = { excludedTemplates: string[]; items: Record<string, TemplateItemChoice> };

const itemId = (templateKey: string, ref: string) => `${templateKey}/${ref}`;

/**
 * A template's page: what it will do in this company, item by item, and the one button that does it
 * (TEMPLATES_DESIGN.md § 3.3–3.4, § 4.3). Editing here is what T4 allows — pick the items, settle a
 * clash, untick a role's grants; everything else happens on the created object afterwards.
 */
export const TemplatePreview: React.FC<{ templateKey: string }> = ({ templateKey }) => {
  const [choices, setChoices] = React.useState<Choices>({ excludedTemplates: [], items: {} });
  const [appliedId, setAppliedId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [applyError, setApplyError] = React.useState<string | null>(null);
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const request: TemplateChoicesRequest = React.useMemo(
    () => ({ excludedTemplates: choices.excludedTemplates, items: Object.values(choices.items) }),
    [choices],
  );
  const preview = useTemplatePreview(templateKey, request, !appliedId);
  const apply = useApplyTemplate(templateKey);

  const choose = (templateKey: string, ref: string, patch: Partial<TemplateItemChoice>) => {
    setNotice(null);
    setApplyError(null);
    setChoices((c) => {
      const id = itemId(templateKey, ref);
      return { ...c, items: { ...c.items, [id]: { ...(c.items[id] ?? { templateKey, ref }), ...patch } } };
    });
  };

  const toggleTemplate = (key: string, included: boolean) => {
    setNotice(null);
    setChoices((c) => ({
      ...c,
      excludedTemplates: included ? c.excludedTemplates.filter((k) => k !== key) : [...c.excludedTemplates, key],
    }));
  };

  const onApply = async () => {
    if (!preview.data) return;
    setApplyError(null);
    const result = await apply.mutateAsync({ ...request, fingerprint: preview.data.fingerprint });
    if (result.status === ActionStatus.SUCCESS && result.data) {
      setAppliedId(result.data.id);
      return;
    }
    if (result.code === "TPL00002") {
      // The company moved since this preview was computed: show the new one, keep the choices.
      setNotice(messageForCode("TPL00002"));
      await preview.refetch();
      return;
    }
    setApplyError(result.errorMessage ?? null);
  };

  if (appliedId) return <TemplateResult applicationId={appliedId}/>;

  const data = preview.data;
  return (
    <div className="space-y-6 px-8 pb-10">
      <div className="space-y-4">
        <SettingsPageHeader title={data?.title ?? t("templates.preview.fallbackTitle")} backHref={BACK}/>
        {data && (
          <PageDescription className="text-body text-tertiary/90">
            {t("templates.preview.description", { summary: data.summary, version: data.version })}
          </PageDescription>
        )}
      </div>

      {preview.error && !data ? (
        <ErrorState error={preview.error} onRetry={() => void preview.refetch()}/>
      ) : !data ? (
        <PreviewSkeleton/>
      ) : (
        <>
          {notice && (
            <InlineAlert tone="pending">
              {notice}
            </InlineAlert>
          )}

          {data.parts.map((part) => (
            <PartSection
              key={part.key}
              part={part}
              onToggle={(included) => toggleTemplate(part.key, included)}
              onChoose={(ref, patch) => choose(part.key, ref, patch)}
            />
          ))}

          <FormError message={applyError}/>

          <div className="flex items-center justify-end gap-3 border-t border-divider pt-4">
            <span className="text-body text-tertiary">
              {summaryLine(t, data.counts)}
            </span>
            <Button asChild variant="secondary">
              <Link href={BACK} className="no-underline">{tCommon("actions.cancel")}</Link>
            </Button>
            <Button
              type="button"
              onClick={() => void onApply()}
              disabled={apply.isPending || preview.isFetching || data.counts.create === 0}
            >
              {data.counts.create === 0
                ? t("templates.preview.nothingToCreate")
                : t("templates.preview.apply", { count: data.counts.create })}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const summaryLine = (t: Translator, c: { create: number; existing: number; skip: number; dropped: number }) =>
  [
    c.existing > 0 ? t("templates.preview.summary.existing", { count: c.existing }) : null,
    c.skip > 0 ? t("templates.preview.summary.skipped", { count: c.skip }) : null,
    c.dropped > 0 ? t("templates.preview.summary.dropped", { count: c.dropped }) : null,
  ].filter(Boolean).join(" · ");

const PartSection: React.FC<{
  part: TemplatePartDTO;
  onToggle: (included: boolean) => void;
  onChoose: (ref: string, patch: Partial<TemplateItemChoice>) => void;
}> = ({ part, onToggle, onChoose }) => {
  const t = useTranslations("settings");
  return (
  <section className="space-y-2" aria-label={part.title}>
    {part.root ? null : (
      <div className="flex items-start gap-3 rounded-control bg-subtle px-4 py-3">
        <Checkbox
          id={`include-${part.key}`}
          checked={part.included}
          onCheckedChange={(v) => onToggle(Boolean(v))}
          aria-label={t("templates.preview.include", { title: part.title })}
        />
        <label htmlFor={`include-${part.key}`} className="min-w-0 text-body">
          <span className="font-medium">{t("templates.preview.include", { title: part.title })}</span>
          <span className="block text-tertiary">
            {part.appliedBefore ? t("templates.preview.appliedBefore") : t("templates.preview.usesFields")}
          </span>
        </label>
      </div>
    )}
    <ul className={`divide-y divide-divider rounded-control border border-divider ${part.included ? "" : "opacity-60"}`}>
      {part.items.map((item) => (
        <ItemRow key={item.ref} item={item} disabled={!part.included} onChoose={(patch) => onChoose(item.ref, patch)}/>
      ))}
    </ul>
  </section>
  );
};

const ItemRow: React.FC<{
  item: TemplateItemDTO;
  disabled: boolean;
  onChoose: (patch: Partial<TemplateItemChoice>) => void;
}> = ({ item, disabled, onChoose }) => {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("settings");
  const outcome = OUTCOME[item.outcome];
  const canInclude = item.type !== "SECTION" && item.outcome !== "DROPPED" && item.outcome !== "EXISTING";
  const questions = item.questions ?? [];
  const hasDetail = item.grants.length > 0 || item.tasks.length > 0 || questions.length > 0;

  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex items-start gap-3">
        {canInclude ? (
          <Checkbox
            checked={item.include}
            disabled={disabled}
            onCheckedChange={(v) => onChoose({ include: Boolean(v) })}
            aria-label={t("templates.preview.applyItem", { name: item.name })}
            className="mt-0.5"
          />
        ) : <span className="w-4"/>}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{item.finalName}</span>
            <span className="text-hint text-tertiary">{typeLabel(t, item)}</span>
            <StatusBadge status={outcome.status} label={t(outcome.label)}/>
            {item.sensitive && <Badge variant="outline">{t("templates.sensitive")}</Badge>}
          </div>
          {item.reason && <p className="text-body text-tertiary">{item.reason}</p>}
          {item.type === "FIELD" && item.sensitive && item.outcome !== "EXISTING" && item.include && (
            <p className="flex items-center gap-1 text-body text-tertiary">
              <Icon icon={ShieldAlertIcon} size="sm" />
              {item.readers.length === 0
                ? t("templates.preview.onlyOwner")
                : t("templates.preview.seenBy", { readers: item.readers.join(", ") })}
            </p>
          )}
          {item.outcome === "CLASH" && item.include && (
            <div className="max-w-sm pt-1">
              <Select
                value={item.clash}
                onValueChange={(v) => onChoose({ clash: v as TemplateClashChoice })}
                disabled={disabled}
              >
                <SelectTrigger aria-label={t("templates.preview.clashChoice", { name: item.name })}><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SKIP">{t("templates.preview.clashSkip")}</SelectItem>
                  <SelectItem value="RENAME">{t("templates.preview.clashRename", { name: item.name })}</SelectItem>
                </SelectContent>
              </Select>
              {item.renameTaken && (
                <FieldError>
                  {t("templates.preview.renameTaken", { name: item.finalName })}
                </FieldError>
              )}
            </div>
          )}
        </div>
        {hasDetail && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? <Icon icon={ArrowDown01Icon} size="sm" /> : <Icon icon={ArrowRight01Icon} size="sm" />}
            {item.grants.length > 0
              ? t("templates.preview.grantsCount", { selected: item.grants.filter((g) => g.selected).length, count: item.grants.length })
              : questions.length > 0
                ? t("templates.preview.entriesCount", { count: questions.length })
                : t("templates.preview.tasksCount", { count: item.tasks.length })}
          </Button>
        )}
      </div>

      {open && item.grants.length > 0 && (
        <GrantList
          grants={item.grants}
          disabled={disabled || !item.include || item.outcome === "EXISTING"}
          onChange={(keys) => onChoose({ grants: keys })}
        />
      )}
      {open && questions.length > 0 && (
        <ol className="ml-7 list-decimal space-y-1 pl-4 text-body">
          {questions.map((q, i) => <li key={`${i}-${q}`}>{q}</li>)}
        </ol>
      )}
      {open && item.tasks.length > 0 && (
        <ul className="ml-7 space-y-1 text-body">
          {item.tasks.map((task) => (
            <li key={task.key} className={task.dropped ? "text-tertiary line-through" : ""}>
              <span>{dueLabel(t, task.dueKind, task.offsetDays)} · {task.title}</span>
              <span className="text-tertiary"> — {assigneeLabel(t, task.assignee)}</span>
              {task.dropped && task.reason && <span className="block no-underline">{task.reason}</span>}
              {task.droppedFields.map((f) => <span key={f} className="block text-tertiary">{f}</span>)}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * A role's grants, each one tickable. A grant that lands on a field the company already fills says so
 * — "existing field · N values" — and a sensitive one starts unticked (review item 7).
 */
const GrantList: React.FC<{
  grants: TemplateGrantDTO[];
  disabled: boolean;
  onChange: (selectedKeys: string[]) => void;
}> = ({ grants, disabled, onChange }) => {
  const t = useTranslations("settings");
  const selected = new Set(grants.filter((g) => g.selected).map((g) => g.key));
  const toggle = (key: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(key); else next.delete(key);
    onChange([...next]);
  };
  const permissions = grants.filter((g) => g.permission);
  const fields = grants.filter((g) => !g.permission);

  const row = (g: TemplateGrantDTO) => (
    <li key={g.key} className="flex items-start gap-2">
      <Checkbox
        checked={g.selected}
        disabled={disabled || g.dropped}
        onCheckedChange={(v) => toggle(g.key, Boolean(v))}
        aria-label={`${g.label} ${g.action}`}
        className="mt-0.5"
      />
      <div className="min-w-0">
        <span className={g.dropped ? "text-tertiary line-through" : ""}>
          {g.label} · {g.action} · {g.scopes.map((s) => scopeLabel(t, s)).join(", ")}
        </span>
        {g.existingField && (
          <span className="ml-2 text-hint text-tertiary">
            {t("templates.preview.existingField", { count: g.valueCount ?? 0 })}
          </span>
        )}
        {g.sensitive && <Badge variant="outline" className="ml-2">{t("templates.sensitive")}</Badge>}
        {g.dropped && g.reason && <span className="block text-hint text-tertiary">{g.reason}</span>}
      </div>
    </li>
  );

  return (
    <div className="ml-7 grid gap-4 text-body md:grid-cols-2">
      {permissions.length > 0 && (
        <div className="space-y-1">
          <p className="font-medium">{t("templates.preview.permissions")}</p>
          <ul className="space-y-1">{permissions.map(row)}</ul>
        </div>
      )}
      {fields.length > 0 && (
        <div className="space-y-1">
          <p className="font-medium">{t("templates.preview.fieldAccess")}</p>
          <ul className="space-y-1">{fields.map(row)}</ul>
        </div>
      )}
    </div>
  );
};

/** After the apply: what was created, as links; what was skipped or dropped, with why. */
const TemplateResult: React.FC<{ applicationId: string }> = ({ applicationId }) => {
  const { data, error, refetch } = useTemplateApplication(applicationId);
  const t = useTranslations("settings");
  return (
    <div className="space-y-6 px-8 pb-10">
      <div className="space-y-4">
        <SettingsPageHeader title={data ? t("templates.result.title", { title: data.templateTitle }) : t("templates.result.fallbackTitle")} backHref={BACK}/>
        <PageDescription className="text-body text-tertiary/90">
          {t("templates.result.description")}
        </PageDescription>
      </div>
      {error ? (
        <ErrorState error={error} compact onRetry={() => void refetch()}/>
      ) : !data ? (
        <PreviewSkeleton/>
      ) : (
        <ul className="divide-y divide-divider rounded-control border border-divider">
          {data.items.map((i) => <ResultRow key={`${i.templateKey}/${i.ref}`} item={i}/>)}
        </ul>
      )}
      <Button asChild variant="secondary">
        <Link href={BACK} className="no-underline">{t("templates.result.back")}</Link>
      </Button>
    </div>
  );
};

const RESULT = {
  CREATED: { status: "approved", label: "templates.result.outcome.created" },
  EXISTING: { status: "inactive", label: "templates.outcome.existing" },
  SKIPPED: { status: "inactive", label: "templates.result.outcome.skipped" },
  DROPPED: { status: "archived", label: "templates.outcome.dropped" },
} as const satisfies Record<TemplateRecordedItem["outcome"], { status: StatusTone; label: string }>;

const ResultRow: React.FC<{ item: TemplateRecordedItem }> = ({ item }) => {
  const t = useTranslations("settings");
  const href = item.outcome === "CREATED" || item.outcome === "EXISTING" ? linkTo(item) : null;
  return (
    <li className="space-y-1 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {href ? <Link href={href} className="font-medium">{item.objectName}</Link> : <span className="font-medium">{item.objectName}</span>}
        <span className="text-hint text-tertiary">{t(RECORD_TYPE[item.type])}</span>
        <StatusBadge status={RESULT[item.outcome].status} label={t(RESULT[item.outcome].label)}/>
      </div>
      {item.reason && <p className="text-body text-tertiary">{item.reason}</p>}
      {(item.notes ?? []).map((n) => <p key={n} className="text-body text-tertiary">{n}</p>)}
    </li>
  );
};

const RECORD_TYPE = {
  SECTION: "templates.type.section",
  FIELD: "templates.type.field",
  ROLE: "templates.type.role",
  PROCESS: "templates.type.checklist",
  FORM: "templates.type.reviewForm",
} as const satisfies Record<TemplateRecordedItem["type"], string>;

const linkTo = (item: TemplateRecordedItem): string | null => {
  if (!item.objectId) return null;
  switch (item.type) {
    case "ROLE":
      return `/settings/people/roles/${item.objectId}`;
    case "FIELD":
    case "SECTION":
      return "/settings/people/attributes";
    case "PROCESS":
      return `/settings/automation/${String(item.subtype ?? "ONBOARDING").toLowerCase()}/${item.objectId}`;
    case "FORM":
      return `/reviews/forms/${item.objectId}`;
    default:
      return null;
  }
};

const typeLabel = (t: Translator, item: TemplateItemDTO): string => {
  switch (item.type) {
    case "SECTION":
      return t("templates.type.section");
    case "FIELD":
      return item.fieldType ? t("templates.type.fieldOf", { type: fieldTypeLabel(t, item.fieldType) }) : t("templates.type.field");
    case "ROLE":
      return t("templates.type.role");
    case "PROCESS":
      return t("templates.type.checklist");
    case "FORM":
      return t("templates.type.reviewForm");
  }
};

/** A code the catalogue has no word for, made readable ("SOME_CODE" → "Some code"). */
const humanise = (code: string) => code.charAt(0) + code.slice(1).toLowerCase().replace(/_/g, " ");

const isAttributeType = (code: string): code is AttributeType =>
  (Object.values(AttributeType) as string[]).includes(code);

const fieldTypeLabel = (t: Translator, code: string) =>
  isAttributeType(code) ? t(attributeTypeLabelKey(code)) : humanise(code);

const scopeLabel = (t: Translator, s: string) => {
  switch (s) {
    case "COMPANY":
      return t("templates.scope.company");
    case "DIRECT_REPORTS":
      return t("templates.scope.directReports");
    case "SELF":
      return t("templates.scope.self");
    default:
      return humanise(s);
  }
};

const dueLabel = (t: Translator, dueKind: string, offsetDays: number | null) => {
  if (dueKind !== "OFFSET" || offsetDays == null) return t("templates.due.beforeStart");
  return offsetDays < 0 ? t("templates.due.daysBefore", { count: -offsetDays }) : t("templates.due.day", { day: offsetDays + 1 });
};

const assigneeLabel = (t: Translator, a: string) =>
  a === "TARGET" ? t("templates.assignee.target") : a === "ONBOARDING_MANAGER" ? t("templates.assignee.onboardingManager") : a;

const PreviewSkeleton: React.FC = () => (
  <ul className="divide-y divide-divider rounded-control border border-divider" aria-busy="true">
    {[0, 1, 2, 3].map((i) => (
      <li key={i} className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="h-4 w-4"/>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-56"/>
          <Skeleton className="h-3 w-72"/>
        </div>
      </li>
    ))}
  </ul>
);
