"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Add01Icon, CalendarAdd01Icon, Cancel01Icon, Copy01Icon, Delete02Icon, Layout01Icon, Rocket01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Textarea } from "@/components/desact/textarea";
import { Checkbox } from "@/components/desact/checkbox";
import { Switch } from "@/components/desact/switch";
import { Label } from "@/components/desact/label";
import { Skeleton } from "@/components/desact/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/desact/select";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { StickyPageBar } from "@/components/layout/StickyPageBar";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormError } from "@/components/feedback/FormError";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { useCanAccess } from "@/components/auth/useAccess";
import { showSuccess } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { useUnsavedChangesGuard } from "@/components/modules/automations/builder/useUnsavedChangesGuard";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import { deleteCycleAction, saveCycleAction } from "@/components/modules/reviews/actions/reviewCycleActions";
import { useInvalidateReviews, useReviewForms } from "@/components/modules/reviews/hooks";
import { CycleStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import {
  REVIEW_APPROVAL_MODE_KEYS,
  REVIEW_KIND_DESCRIPTION_KEYS,
  REVIEW_KIND_KEYS,
  REVIEW_KINDS,
  REVIEW_PEER_MODE_KEYS,
  type Cycle,
  type ReviewApprovalMode,
  type ReviewKind,
  type ReviewPeerMode,
} from "@/models/reviews";
import {
  ANONYMITY_THRESHOLD_MAX,
  ANONYMITY_THRESHOLD_MIN,
  cycleDraftOf,
  draftProblems,
  newCycleDraft,
  sameCycleDraft,
  toCycleWrite,
  type CycleDraft,
  type KindDraft,
} from "./cycleDraft";
import { LaunchDialog } from "./LaunchDialog";
import { RepeatCycleDialog, useCycleCopies } from "../CycleCopyActions";
import { FieldError } from "@/components/desact/field-error";

const MIN_POINTS = 3;
const MAX_POINTS = 7;

/**
 * Reviews → a cycle as a draft (REVIEWS_DESIGN.md § 12.3): who takes part, which reviews and on which forms, when,
 * on what scale, and how results are shared. Saved whole; launched through a preview. A launched cycle opens on its
 * own page instead.
 */
export function CycleBuilderContainer({ cycle }: { cycle: Cycle | null }) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const invalidate = useInvalidateReviews();
  const forms = useReviewForms();
  const { data: fields, isLoading: fieldsLoading } = useUserFields();
  const canManage = useCanAccess("REVIEWS.CYCLE", "MANAGE");

  const [baseline, setBaseline] = useState<CycleDraft>(() => (cycle ? cycleDraftOf(cycle, t) : newCycleDraft(t)));
  const [draft, setDraft] = useState<CycleDraft>(baseline);
  const [version, setVersion] = useState<number | null>(cycle?.version ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [repeating, setRepeating] = useState(false);
  const copies = useCycleCopies();
  // A template is edited like a draft and never launched: cycles are started from it (REVIEWS_PLAN.md 11.2).
  const isTemplate = cycle?.template === true;

  useEffect(() => {
    if (!cycle) return;
    const d = cycleDraftOf(cycle, t);
    setBaseline(d);
    setDraft(d);
    setVersion(cycle.version);
    // The translator only seeds an empty scale; a change of language does not reset a cycle being edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle]);

  const readOnly = !canManage;
  const dirty = !sameCycleDraft(draft, baseline);
  const guard = useUnsavedChangesGuard(dirty && !readOnly);
  const problems = useMemo(() => draftProblems(draft, t), [draft, t]);
  const liveForms = (forms.data ?? []).filter((f) => !f.archivedAt);

  const patch = (p: Partial<CycleDraft>) => setDraft((d) => ({ ...d, ...p }));
  const patchKind = (k: ReviewKind, p: Partial<KindDraft>) =>
    setDraft((d) => ({ ...d, kinds: { ...d.kinds, [k]: { ...d.kinds[k], ...p } } }));

  const save = async () => {
    // Nothing changed: nothing to send. A problem with the draft is already named beside Save.
    if (saving || !dirty || problems.length > 0) return;
    setError(null);
    setNameError(null);
    setSaving(true);
    try {
      const res = await saveCycleAction({ id: cycle?.id ?? null, body: toCycleWrite(draft, version) });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        if (res.fieldErrors?.name) setNameError(res.fieldErrors.name);
        else setError(res.errorMessage ?? t("error.generic"));
        return;
      }
      const saved = cycleDraftOf(res.data, t);
      setBaseline(saved);
      setDraft(saved);
      setVersion(res.data.version);
      await invalidate();
      showSuccess(t("builder.saved"));
      if (!cycle) router.replace(`/reviews/cycles/${res.data.id}`);
    } finally {
      setSaving(false);
    }
  };

  if (forms.error) return <div className="mx-auto max-w-4xl"><ErrorState error={forms.error} /></div>;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16">
      <StickyPageBar className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <SettingsPageHeader title={cycle ? cycle.name : t("builder.newCycle")} backHref="/reviews" className="min-w-0 flex-1" />
          {cycle && (isTemplate ? <StatusBadge status="draft" label={t("overview.row.template")} /> : <CycleStatusBadge status={cycle.status} />)}
          {!readOnly && (
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => void save()}
                disabled={saving}>
                {saving ? tCommon("actions.saving") : isTemplate ? t("builder.saveTemplate") : t("builder.saveDraft")}
              </Button>
              {cycle && !isTemplate && (
                <Button type="button" className="gap-1.5" onClick={() => setLaunching(true)} disabled={dirty || saving}>
                  <Icon icon={Rocket01Icon} size="sm" />
                  {t("launch.launch")}
                </Button>
              )}
              {cycle && (
                <RowActionsMenu label={t("builder.actions")}>
                  {/* Copies are taken of what is saved: unsaved changes would not travel with them (11.1, 11.2). */}
                  {isTemplate ? (
                    <RowAction icon={<Icon icon={Add01Icon} size="sm" className="text-tertiary" />} disabled={dirty || copies.busy}
                      title={dirty ? t("builder.saveTemplateFirst") : undefined}
                      onClick={() => void copies.startFromTemplate(cycle.id)}>
                      {t("builder.addCycleFromIt")}
                    </RowAction>
                  ) : (
                    <>
                      <RowAction icon={<Icon icon={Copy01Icon} size="sm" className="text-tertiary" />} disabled={dirty || copies.busy}
                        title={dirty ? t("builder.saveDraftFirst") : undefined} onClick={() => void copies.duplicate(cycle.id)}>
                        {tCommon("actions.duplicate")}
                      </RowAction>
                      <RowAction icon={<Icon icon={CalendarAdd01Icon} size="sm" className="text-tertiary" />} disabled={dirty}
                        title={dirty ? t("builder.saveDraftFirst") : undefined} onClick={() => setRepeating(true)}>
                        {t("builder.repeat")}
                      </RowAction>
                      <RowAction icon={<Icon icon={Layout01Icon} size="sm" className="text-tertiary" />} disabled={dirty || copies.busy}
                        title={dirty ? t("builder.saveDraftFirst") : undefined} onClick={() => void copies.saveAsTemplate(cycle.id)}>
                        {t("builder.saveAsTemplate")}
                      </RowAction>
                    </>
                  )}
                  <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setDeleting(true)}>
                    {tCommon("actions.delete")}
                  </RowActionDestructive>
                </RowActionsMenu>
              )}
            </div>
          )}
        </div>
        {!readOnly && (dirty || problems.length > 0) && (
          <p className="text-right text-hint text-tertiary">
            {problems[0] ?? (cycle && !isTemplate ? t("builder.saveToLaunch") : t("editor.unsaved"))}
          </p>
        )}
      </StickyPageBar>
      {isTemplate && (
        <p className="-mt-3 text-body text-tertiary">
          {t("builder.templateNote")}
        </p>
      )}
      <FormError message={error} />

      <Card title={t("builder.basics")}>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="cycle-name" required>{tCommon("fields.name")}</RequiredLabel>
          <Input id="cycle-name" value={draft.name} disabled={readOnly} aria-invalid={nameError ? true : undefined}
            onChange={(e) => { patch({ name: e.target.value }); setNameError(null); }} />
          {nameError && <FieldError>{nameError}</FieldError>}
        </div>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="cycle-description">{tCommon("fields.description")}</RequiredLabel>
          <Textarea id="cycle-description" rows={2} value={draft.description} disabled={readOnly}
            onChange={(e) => patch({ description: e.target.value })} />
        </div>
      </Card>

      <Card title={t("builder.who.title")} hint={t("builder.who.hint")}>
        <AudienceBuilder fields={fields} isLoadingFields={fieldsLoading} value={draft.filters}
          onChange={(filters) => !readOnly && patch({ filters })} />
        <div className="max-w-xs space-y-1.5">
          <RequiredLabel htmlFor="cycle-eligible">{t("copies.date.hiredBefore")}</RequiredLabel>
          <DatePicker id="cycle-eligible" value={draft.eligibleHiredBefore} disabled={readOnly} clearable
            onChange={(v) => patch({ eligibleHiredBefore: v })} />
          <p className="text-hint text-tertiary">{t("builder.who.hiredHint")}</p>
        </div>
      </Card>

      <Card title={t("builder.reviews.title")} hint={t("builder.reviews.hint")}>
        {forms.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="divide-y divide-divider">
            {REVIEW_KINDS.map((k) => (
              <KindRow key={k} kind={k} value={draft.kinds[k]} readOnly={readOnly}
                forms={pickableForms(forms.data ?? [], draft.kinds[k].formId, (name) => t("builder.reviews.archivedForm", { name }))}
                onChange={(p) => patchKind(k, p)} />
            ))}
          </div>
        )}
        {liveForms.length === 0 && !forms.isLoading && (
          <p className="rounded-control bg-subtle/60 px-4 py-3 text-body text-primary">
            {t.rich("builder.reviews.noForms", {
              link: (c) => (
                <Link href="/reviews/forms" className="font-medium text-accent-text underline-offset-4 hover:underline">{c}</Link>
              ),
            })}
          </p>
        )}
      </Card>

      <Card title={t("builder.scale.title")} hint={t("builder.scale.hint")}>
        <ol className="space-y-2">
          {draft.scale.map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-6 text-right text-body font-medium text-tertiary">{i + 1}</span>
              <Input aria-label={t("builder.scale.point", { number: i + 1 })} value={p.label} disabled={readOnly} className="max-w-sm"
                onChange={(e) => patch({ scale: draft.scale.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
              {!readOnly && draft.scale.length > MIN_POINTS && (
                <Button type="button" variant="ghost" size="icon-sm" aria-label={t("builder.scale.removePoint", { number: i + 1 })}
                  onClick={() => patch({ scale: draft.scale.filter((_, j) => j !== i) })}>
                  <Icon icon={Cancel01Icon} size="sm" />
                </Button>
              )}
            </li>
          ))}
        </ol>
        {!readOnly && draft.scale.length < MAX_POINTS && (
          <Button type="button" variant="ghost" size="sm" className="gap-1 text-secondary"
            onClick={() => patch({ scale: [...draft.scale, { value: draft.scale.length + 1, label: "" }] })}>
            <Icon icon={Add01Icon} size="sm" />
            {t("builder.scale.addPoint")}
          </Button>
        )}
      </Card>

      <Card title={t("builder.results.title")} hint={t("builder.results.hint")}>
        <RadioGroup value={draft.sharingMode} disabled={readOnly}
          onValueChange={(v) => patch({ sharingMode: v as CycleDraft["sharingMode"] })} className="space-y-2">
          <label className="flex items-start gap-2 text-body">
            <RadioGroupItem value="MANAGER_SHARES" className="mt-0.5" />
            <span>{t.rich("builder.results.managerShares", { b: (c) => <span className="font-medium">{c}</span> })}</span>
          </label>
          <label className="flex items-start gap-2 text-body">
            <RadioGroupItem value="RELEASED_ON_DATE" className="mt-0.5" />
            <span>{t.rich("builder.results.releasedOnDate", { b: (c) => <span className="font-medium">{c}</span> })}</span>
          </label>
        </RadioGroup>
        {draft.sharingMode === "RELEASED_ON_DATE" && (
          <div className="max-w-xs space-y-1.5">
            <RequiredLabel htmlFor="cycle-release" required>{t("builder.results.releaseDate")}</RequiredLabel>
            <DatePicker id="cycle-release" value={draft.releaseDate} disabled={readOnly}
              onChange={(v) => patch({ releaseDate: v })} />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <RequiredLabel htmlFor="cycle-approval">{t("builder.results.approval")}</RequiredLabel>
            <Select value={draft.approvalMode} disabled={readOnly}
              onValueChange={(v) => patch({ approvalMode: v as ReviewApprovalMode })}>
              <SelectTrigger id="cycle-approval"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(REVIEW_APPROVAL_MODE_KEYS) as ReviewApprovalMode[]).map((m) => (
                  <SelectItem key={m} value={m}>{t(REVIEW_APPROVAL_MODE_KEYS[m])}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {draft.approvalMode === "PERSON" && (
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="cycle-approver" required>{t("builder.results.approver")}</RequiredLabel>
              <UserPickerField id="cycle-approver" disabled={readOnly} placeholder={t("builder.results.selectPerson")}
                value={draft.approverUserId ? { id: draft.approverUserId, firstName: draft.approverName } : null}
                onChange={(u) => patch({
                  approverUserId: u?.id ?? null,
                  approverName: u ? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || null : null,
                })} />
            </div>
          )}
        </div>
        {draft.approvalMode !== "NONE" && (
          <p className="text-hint text-tertiary">
            {draft.approvalMode === "SKIP_LEVEL" ? t("builder.results.approvalHintSkipLevel") : t("builder.results.approvalHint")}
          </p>
        )}
      </Card>

      {cycle && <RepeatCycleDialog cycle={cycle} open={repeating} onCloseAction={() => setRepeating(false)} />}

      {cycle && !isTemplate && (
        <LaunchDialog cycleId={cycle.id} open={launching} onCloseAction={() => setLaunching(false)}
          onLaunchedAction={async () => {
            setLaunching(false);
            await invalidate();
            showSuccess(t("builder.launched"));
            router.refresh();
          }} />
      )}

      <ConfirmDialog
        open={deleting}
        title={isTemplate ? t("builder.deleteDialog.templateTitle") : t("builder.deleteDialog.cycleTitle")}
        confirmLabel={tCommon("actions.delete")}
        destructive
        onCancelAction={() => setDeleting(false)}
        onConfirmAction={async () => {
          if (!cycle) return null;
          const res = await deleteCycleAction(cycle.id);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
          setDeleting(false);
          setBaseline(draft);
          // Leave first: refetching this page's own cycle, now gone, painted "Not found" until the push landed.
          router.push("/reviews");
          await invalidate();
          return null;
        }}
      >
        <p>
          {t.rich(isTemplate ? "builder.deleteDialog.templateBody" : "builder.deleteDialog.cycleBody", {
            name: cycle?.name ?? "",
            b: (c) => <strong>{c}</strong>,
          })}
        </p>
      </ConfirmDialog>

      <ConfirmCancelModal
        isOpen={guard.pendingHref !== null}
        title={t("editor.leave.title")}
        description={t("builder.leaveDescription")}
        cancelText={t("editor.leave.stay")}
        confirmText={t("editor.leave.leave")}
        onCancelAction={guard.stay}
        onConfirmAction={guard.leave}
      />
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-card border border-divider bg-card p-5">
      <div>
        <h2 className="text-body font-semibold text-primary">{title}</h2>
        {hint && <p className="mt-0.5 text-body text-tertiary">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * The live forms, and the one this kind already uses when it has since been archived — dropped from the list, the
 * picker showed an empty box and only the launch preview said why.
 */
function pickableForms(
  all: { id: string; name: string; archivedAt?: string | null }[],
  chosenId: string | null | undefined,
  archivedName: (name: string) => string,
) {
  return all
    .filter((f) => !f.archivedAt || f.id === chosenId)
    .map((f) => ({ id: f.id, name: f.archivedAt ? archivedName(f.name) : f.name }));
}

function KindRow({ kind, value, forms, readOnly, onChange }: {
  kind: ReviewKind;
  value: KindDraft;
  forms: { id: string; name: string }[];
  readOnly: boolean;
  onChange: (p: Partial<KindDraft>) => void;
}) {
  const t = useTranslations("reviews");
  const id = `kind-${kind.toLowerCase()}`;
  return (
    <div className="space-y-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Switch id={`${id}-on`} checked={value.enabled} disabled={readOnly} onCheckedChange={(c) => onChange({ enabled: c })}
          aria-label={t(REVIEW_KIND_KEYS[kind])} />
        <div>
          <Label htmlFor={`${id}-on`} className="font-medium text-primary">{t(REVIEW_KIND_KEYS[kind])}</Label>
          <p className="text-hint text-tertiary">{t(REVIEW_KIND_DESCRIPTION_KEYS[kind])}</p>
        </div>
      </div>
      {value.enabled && (
        <div className="grid gap-3 pl-12 sm:grid-cols-3">
          <div className="space-y-1.5">
            <RequiredLabel htmlFor={`${id}-form`} required>{t("builder.kind.form")}</RequiredLabel>
            <Select value={value.formId ?? ""} disabled={readOnly} onValueChange={(v) => onChange({ formId: v })}>
              <SelectTrigger id={`${id}-form`}><SelectValue placeholder={t("builder.kind.selectForm")} /></SelectTrigger>
              <SelectContent>
                {forms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <RequiredLabel htmlFor={`${id}-opens`}>{t("builder.kind.opensOn")}</RequiredLabel>
            <DatePicker id={`${id}-opens`} value={value.opensOn} disabled={readOnly} clearable onChange={(v) => onChange({ opensOn: v })} />
          </div>
          <div className="space-y-1.5">
            <RequiredLabel htmlFor={`${id}-due`} required>{t("builder.kind.dueOn")}</RequiredLabel>
            <DatePicker id={`${id}-due`} value={value.dueOn} disabled={readOnly} onChange={(v) => onChange({ dueOn: v })} />
          </div>
          {kind === "UPWARD" && (
            <div className="space-y-1.5 sm:col-span-3">
              <NumberField id={`${id}-threshold`} label={t("builder.kind.threshold")} value={value.anonymityThreshold}
                min={ANONYMITY_THRESHOLD_MIN} max={ANONYMITY_THRESHOLD_MAX} disabled={readOnly}
                onChange={(n) => onChange({ anonymityThreshold: n })} />
              <p className="text-hint text-tertiary">
                {t("builder.kind.upwardHint")}
              </p>
            </div>
          )}
          {kind === "PEER" && (
            <>
              <div className="space-y-1.5 sm:col-span-3">
                <RequiredLabel htmlFor={`${id}-mode`}>{t("builder.kind.peerMode")}</RequiredLabel>
                <Select value={value.peerMode} disabled={readOnly} onValueChange={(v) => onChange({ peerMode: v as ReviewPeerMode })}>
                  <SelectTrigger id={`${id}-mode`} className="max-w-md"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(REVIEW_PEER_MODE_KEYS) as ReviewPeerMode[]).map((m) => (
                      <SelectItem key={m} value={m}>{t(REVIEW_PEER_MODE_KEYS[m])}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {value.peerMode === "SUBJECT_NOMINATES" && (
                <>
                  <div className="space-y-1.5">
                    <RequiredLabel htmlFor={`${id}-nominate`} required>{t("builder.kind.nominatedBy")}</RequiredLabel>
                    <DatePicker id={`${id}-nominate`} value={value.nominationDueOn} disabled={readOnly}
                      onChange={(v) => onChange({ nominationDueOn: v })} />
                  </div>
                  <div className="space-y-1.5">
                    <RequiredLabel htmlFor={`${id}-approve`} required>{t("builder.kind.approvedBy")}</RequiredLabel>
                    <DatePicker id={`${id}-approve`} value={value.approvalDueOn} disabled={readOnly}
                      onChange={(v) => onChange({ approvalDueOn: v })} />
                  </div>
                  <p className="text-hint text-tertiary sm:col-span-3">
                    {t("builder.kind.nominateHint")}
                  </p>
                </>
              )}
              <NumberField id={`${id}-min`} label={t("builder.kind.peerMin")} value={value.peerMin} disabled={readOnly} onChange={(n) => onChange({ peerMin: n })} />
              <NumberField id={`${id}-max`} label={t("builder.kind.peerMax")} value={value.peerMax} disabled={readOnly} onChange={(n) => onChange({ peerMax: n })} />
              <NumberField id={`${id}-cap`} label={t("builder.kind.reviewerCap")} value={value.reviewerCap} disabled={readOnly}
                onChange={(n) => onChange({ reviewerCap: n })} />
              <label className="flex items-center gap-2 text-body sm:col-span-3">
                <Checkbox checked={value.anonymous} disabled={readOnly} onCheckedChange={(c) => onChange({ anonymous: c === true })} />
                {t("builder.kind.anonymous")}
              </label>
              {value.anonymous && (
                <div className="space-y-1.5 sm:col-span-3">
                  <NumberField id={`${id}-threshold`} label={t("builder.kind.threshold")} value={value.anonymityThreshold}
                    min={ANONYMITY_THRESHOLD_MIN} max={ANONYMITY_THRESHOLD_MAX} disabled={readOnly}
                    onChange={(n) => onChange({ anonymityThreshold: n })} />
                  <p className="text-hint text-tertiary">
                    {value.peerMax < value.anonymityThreshold ? t("builder.kind.peerHintBelow") : t("builder.kind.peerHint")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NumberField({ id, label, value, disabled, onChange, min = 1, max = 20 }: {
  id: string;
  label: string;
  value: number;
  disabled: boolean;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <RequiredLabel htmlFor={id}>{label}</RequiredLabel>
      <Input id={id} type="number" min={min} max={max} value={value} disabled={disabled}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} />
    </div>
  );
}
