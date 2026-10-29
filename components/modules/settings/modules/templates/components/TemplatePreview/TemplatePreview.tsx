"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ShieldAlert } from "lucide-react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/public/desact/src/components/ui/select";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { StatusBadge, type EntityStatus } from "@/components/ui/StatusBadge";
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

const BACK = "/settings/general/templates";

/** The preview's outcomes on the shared chip (STATUS_AND_BADGES.md § 1): the mapping is all a caller writes. */
const OUTCOME: Record<TemplateOutcome, { status: EntityStatus; label: string }> = {
  NEW: { status: "active", label: "New" },
  EXISTING: { status: "inactive", label: "Already There" },
  CLASH: { status: "draft", label: "Name Taken" },
  DROPPED: { status: "archived", label: "Dropped" },
};

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
        <SettingsPageHeader title={data?.title ?? "Template"} backHref={BACK}/>
        {data && (
          <PageDescription className="text-base text-muted-foreground/90">
            {data.summary} Version {data.version}. Applying copies it into the company: what it creates is
            yours to change afterwards, and nothing links it back to the template.
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
            <div role="status" className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-sm text-warning-800">
              {notice}
            </div>
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

          <div className="flex items-center justify-end gap-3 border-t border-brown-100 pt-4">
            <span className="text-sm text-muted-foreground">
              {summaryLine(data.counts)}
            </span>
            <Button asChild variant="outline">
              <Link href={BACK} className="no-underline">Cancel</Link>
            </Button>
            <Button
              type="button"
              onClick={() => void onApply()}
              disabled={apply.isPending || preview.isFetching || data.counts.create === 0}
            >
              {data.counts.create === 0 ? "Nothing to Create" : `Apply · ${data.counts.create} to Create`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const summaryLine = (c: { create: number; existing: number; skip: number; dropped: number }) =>
  [
    c.existing > 0 ? `${c.existing} already there` : null,
    c.skip > 0 ? `${c.skip} skipped` : null,
    c.dropped > 0 ? `${c.dropped} dropped` : null,
  ].filter(Boolean).join(" · ");

const PartSection: React.FC<{
  part: TemplatePartDTO;
  onToggle: (included: boolean) => void;
  onChoose: (ref: string, patch: Partial<TemplateItemChoice>) => void;
}> = ({ part, onToggle, onChoose }) => (
  <section className="space-y-2" aria-label={part.title}>
    {part.root ? null : (
      <div className="flex items-start gap-3 rounded-md bg-brown-50 px-4 py-3">
        <Checkbox
          id={`include-${part.key}`}
          checked={part.included}
          onCheckedChange={(v) => onToggle(Boolean(v))}
          aria-label={`Include ${part.title}`}
        />
        <label htmlFor={`include-${part.key}`} className="min-w-0 text-sm">
          <span className="font-medium">Include {part.title}</span>
          <span className="block text-muted-foreground">
            {part.appliedBefore
              ? "Applied before — its fields are already in the company, so it is not needed again."
              : "This template uses fields from it. Left out, what points at those fields is dropped."}
          </span>
        </label>
      </div>
    )}
    <ul className={`divide-y divide-brown-100 rounded-lg border border-brown-200 ${part.included ? "" : "opacity-60"}`}>
      {part.items.map((item) => (
        <ItemRow key={item.ref} item={item} disabled={!part.included} onChoose={(patch) => onChoose(item.ref, patch)}/>
      ))}
    </ul>
  </section>
);

const ItemRow: React.FC<{
  item: TemplateItemDTO;
  disabled: boolean;
  onChoose: (patch: Partial<TemplateItemChoice>) => void;
}> = ({ item, disabled, onChoose }) => {
  const [open, setOpen] = React.useState(false);
  const outcome = OUTCOME[item.outcome];
  const canInclude = item.type !== "SECTION" && item.outcome !== "DROPPED" && item.outcome !== "EXISTING";
  const hasDetail = item.grants.length > 0 || item.tasks.length > 0;

  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex items-start gap-3">
        {canInclude ? (
          <Checkbox
            checked={item.include}
            disabled={disabled}
            onCheckedChange={(v) => onChoose({ include: Boolean(v) })}
            aria-label={`Apply ${item.name}`}
            className="mt-0.5"
          />
        ) : <span className="w-4"/>}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{item.finalName}</span>
            <span className="text-xs text-muted-foreground">{typeLabel(item)}</span>
            <StatusBadge status={outcome.status} label={outcome.label}/>
            {item.sensitive && <Badge variant="outline">Sensitive</Badge>}
          </div>
          {item.reason && <p className="text-sm text-muted-foreground">{item.reason}</p>}
          {item.type === "FIELD" && item.sensitive && item.outcome !== "EXISTING" && item.include && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <ShieldAlert className="h-4 w-4"/>
              {item.readers.length === 0
                ? "Only the System Owner will see it until a role is given access."
                : `Seen by ${item.readers.join(", ")} and the System Owner.`}
            </p>
          )}
          {item.outcome === "CLASH" && item.include && (
            <div className="max-w-sm pt-1">
              <Select
                value={item.clash}
                onValueChange={(v) => onChoose({ clash: v as TemplateClashChoice })}
                disabled={disabled}
              >
                <SelectTrigger aria-label={`What to do with ${item.name}`}><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SKIP">Skip — keep the company&apos;s own</SelectItem>
                  <SelectItem value="RENAME">Create as “{item.name} (template)”</SelectItem>
                </SelectContent>
              </Select>
              {item.renameTaken && (
                <p role="alert" className="pt-1 text-sm text-destructive">
                  “{item.finalName}” is taken too. Skip it, or rename the company&apos;s own first.
                </p>
              )}
            </div>
          )}
        </div>
        {hasDetail && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
            {item.grants.length > 0 ? `${item.grants.filter((g) => g.selected).length} of ${item.grants.length} Grants` : `${item.tasks.length} Tasks`}
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
      {open && item.tasks.length > 0 && (
        <ul className="ml-7 space-y-1 text-sm">
          {item.tasks.map((t) => (
            <li key={t.key} className={t.dropped ? "text-muted-foreground line-through" : ""}>
              <span>{dueLabel(t.dueKind, t.offsetDays)} · {t.title}</span>
              <span className="text-muted-foreground"> — {assigneeLabel(t.assignee)}</span>
              {t.dropped && t.reason && <span className="block no-underline">{t.reason}</span>}
              {t.droppedFields.map((f) => <span key={f} className="block text-muted-foreground">{f}</span>)}
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
        <span className={g.dropped ? "text-muted-foreground line-through" : ""}>
          {g.label} · {g.action} · {g.scopes.map(scopeLabel).join(", ")}
        </span>
        {g.existingField && (
          <span className="ml-2 text-xs text-muted-foreground">
            Existing field · {g.valueCount ?? 0} {g.valueCount === 1 ? "value" : "values"}
          </span>
        )}
        {g.sensitive && <Badge variant="outline" className="ml-2">Sensitive</Badge>}
        {g.dropped && g.reason && <span className="block text-xs text-muted-foreground">{g.reason}</span>}
      </div>
    </li>
  );

  return (
    <div className="ml-7 grid gap-4 text-sm md:grid-cols-2">
      {permissions.length > 0 && (
        <div className="space-y-1">
          <p className="font-medium">Permissions</p>
          <ul className="space-y-1">{permissions.map(row)}</ul>
        </div>
      )}
      {fields.length > 0 && (
        <div className="space-y-1">
          <p className="font-medium">Field Access</p>
          <ul className="space-y-1">{fields.map(row)}</ul>
        </div>
      )}
    </div>
  );
};

/** After the apply: what was created, as links; what was skipped or dropped, with why. */
const TemplateResult: React.FC<{ applicationId: string }> = ({ applicationId }) => {
  const { data, error, refetch } = useTemplateApplication(applicationId);
  return (
    <div className="space-y-6 px-8 pb-10">
      <div className="space-y-4">
        <SettingsPageHeader title={data ? `${data.templateTitle} Applied` : "Template Applied"} backHref={BACK}/>
        <PageDescription className="text-base text-muted-foreground/90">
          Everything below is an ordinary part of the company now. Change it on its own page.
        </PageDescription>
      </div>
      {error ? (
        <ErrorState error={error} compact onRetry={() => void refetch()}/>
      ) : !data ? (
        <PreviewSkeleton/>
      ) : (
        <ul className="divide-y divide-brown-100 rounded-lg border border-brown-200">
          {data.items.map((i) => <ResultRow key={`${i.templateKey}/${i.ref}`} item={i}/>)}
        </ul>
      )}
      <Button asChild variant="outline">
        <Link href={BACK} className="no-underline">Back to Templates</Link>
      </Button>
    </div>
  );
};

const RESULT: Record<TemplateRecordedItem["outcome"], { status: EntityStatus; label: string }> = {
  CREATED: { status: "active", label: "Created" },
  EXISTING: { status: "inactive", label: "Already There" },
  SKIPPED: { status: "draft", label: "Skipped" },
  DROPPED: { status: "archived", label: "Dropped" },
};

const ResultRow: React.FC<{ item: TemplateRecordedItem }> = ({ item }) => {
  const href = item.outcome === "CREATED" || item.outcome === "EXISTING" ? linkTo(item) : null;
  return (
    <li className="space-y-1 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {href ? <Link href={href} className="font-medium">{item.objectName}</Link> : <span className="font-medium">{item.objectName}</span>}
        <span className="text-xs text-muted-foreground">{RECORD_TYPE[item.type]}</span>
        <StatusBadge status={RESULT[item.outcome].status} label={RESULT[item.outcome].label}/>
      </div>
      {item.reason && <p className="text-sm text-muted-foreground">{item.reason}</p>}
      {(item.notes ?? []).map((n) => <p key={n} className="text-sm text-muted-foreground">{n}</p>)}
    </li>
  );
};

const RECORD_TYPE: Record<TemplateRecordedItem["type"], string> = {
  SECTION: "Section",
  FIELD: "Field",
  ROLE: "Role",
  PROCESS: "Checklist",
};

const linkTo = (item: TemplateRecordedItem): string | null => {
  if (!item.objectId) return null;
  switch (item.type) {
    case "ROLE":
      return `/settings/people/roles/${item.objectId}`;
    case "FIELD":
    case "SECTION":
      return "/settings/people/attributes";
    case "PROCESS":
      return `/settings/automation/${item.subtype === "PREBOARDING" ? "preboarding" : "onboarding"}/${item.objectId}`;
    default:
      return null;
  }
};

const typeLabel = (item: TemplateItemDTO): string => {
  switch (item.type) {
    case "SECTION":
      return "Section";
    case "FIELD":
      return item.fieldType ? `Field · ${fieldTypeLabel(item.fieldType)}` : "Field";
    case "ROLE":
      return "Role";
    case "PROCESS":
      return "Checklist";
  }
};

const fieldTypeLabel = (t: string) => t.charAt(0) + t.slice(1).toLowerCase().replace(/_/g, " ");

const scopeLabel = (s: string) => {
  switch (s) {
    case "COMPANY":
      return "Company";
    case "DIRECT_REPORTS":
      return "Direct Reports";
    case "SELF":
      return "Own";
    default:
      return fieldTypeLabel(s);
  }
};

const dueLabel = (dueKind: string, offsetDays: number | null) => {
  if (dueKind !== "OFFSET" || offsetDays == null) return "Before the start";
  if (offsetDays === 0) return "Day 1";
  return offsetDays < 0 ? `${-offsetDays} days before` : `Day ${offsetDays + 1}`;
};

const assigneeLabel = (a: string) => (a === "TARGET" ? "the new joiner" : a === "ONBOARDING_MANAGER" ? "the onboarding manager" : a);

const PreviewSkeleton: React.FC = () => (
  <ul className="divide-y divide-brown-100 rounded-lg border border-brown-200" aria-busy="true">
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
