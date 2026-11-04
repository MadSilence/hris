"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  REVIEW_APPROVAL_MODE_LABELS,
  REVIEW_KIND_DESCRIPTIONS,
  REVIEW_KIND_LABELS,
  REVIEW_KINDS,
  REVIEW_PEER_MODE_LABELS,
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
  const router = useRouter();
  const invalidate = useInvalidateReviews();
  const forms = useReviewForms();
  const { data: fields, isLoading: fieldsLoading } = useUserFields();
  const canManage = useCanAccess("REVIEWS.CYCLE", "MANAGE");

  const [baseline, setBaseline] = useState<CycleDraft>(() => (cycle ? cycleDraftOf(cycle) : newCycleDraft()));
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
    const d = cycleDraftOf(cycle);
    setBaseline(d);
    setDraft(d);
    setVersion(cycle.version);
  }, [cycle]);

  const readOnly = !canManage;
  const dirty = !sameCycleDraft(draft, baseline);
  const guard = useUnsavedChangesGuard(dirty && !readOnly);
  const problems = useMemo(() => draftProblems(draft), [draft]);
  const liveForms = (forms.data ?? []).filter((f) => !f.archivedAt);

  const patch = (p: Partial<CycleDraft>) => setDraft((d) => ({ ...d, ...p }));
  const patchKind = (k: ReviewKind, p: Partial<KindDraft>) =>
    setDraft((d) => ({ ...d, kinds: { ...d.kinds, [k]: { ...d.kinds[k], ...p } } }));

  const save = async () => {
    setError(null);
    setNameError(null);
    setSaving(true);
    try {
      const res = await saveCycleAction({ id: cycle?.id ?? null, body: toCycleWrite(draft, version) });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        if (res.fieldErrors?.name) setNameError(res.fieldErrors.name);
        else setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      const saved = cycleDraftOf(res.data);
      setBaseline(saved);
      setDraft(saved);
      setVersion(res.data.version);
      await invalidate();
      showSuccess("Cycle saved.");
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
          <SettingsPageHeader title={cycle ? cycle.name : "New review cycle"} backHref="/reviews" className="min-w-0 flex-1" />
          {cycle && (isTemplate ? <StatusBadge status="draft" label="Template" /> : <CycleStatusBadge status={cycle.status} />)}
          {!readOnly && (
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => void save()}
                disabled={saving || !dirty || problems.length > 0}>
                {saving ? "Saving…" : isTemplate ? "Save template" : "Save draft"}
              </Button>
              {cycle && !isTemplate && (
                <Button type="button" className="gap-1.5" onClick={() => setLaunching(true)} disabled={dirty || saving}>
                  <Icon icon={Rocket01Icon} size="sm" />
                  Launch
                </Button>
              )}
              {cycle && (
                <RowActionsMenu label="Cycle actions">
                  {/* Copies are taken of what is saved: unsaved changes would not travel with them (11.1, 11.2). */}
                  {isTemplate ? (
                    <RowAction icon={<Icon icon={Add01Icon} size="sm" className="text-tertiary" />} disabled={dirty || copies.busy}
                      title={dirty ? "Save the template first." : undefined}
                      onClick={() => void copies.startFromTemplate(cycle.id)}>
                      Add cycle from it
                    </RowAction>
                  ) : (
                    <>
                      <RowAction icon={<Icon icon={Copy01Icon} size="sm" className="text-tertiary" />} disabled={dirty || copies.busy}
                        title={dirty ? "Save the draft first." : undefined} onClick={() => void copies.duplicate(cycle.id)}>
                        Duplicate
                      </RowAction>
                      <RowAction icon={<Icon icon={CalendarAdd01Icon} size="sm" className="text-tertiary" />} disabled={dirty}
                        title={dirty ? "Save the draft first." : undefined} onClick={() => setRepeating(true)}>
                        Repeat…
                      </RowAction>
                      <RowAction icon={<Icon icon={Layout01Icon} size="sm" className="text-tertiary" />} disabled={dirty || copies.busy}
                        title={dirty ? "Save the draft first." : undefined} onClick={() => void copies.saveAsTemplate(cycle.id)}>
                        Save as template
                      </RowAction>
                    </>
                  )}
                  <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setDeleting(true)}>
                    Delete
                  </RowActionDestructive>
                </RowActionsMenu>
              )}
            </div>
          )}
        </div>
        {!readOnly && (dirty || problems.length > 0) && (
          <p className="text-right text-hint text-tertiary">
            {problems[0] ?? (cycle && !isTemplate ? "Save the draft to launch it." : "You have unsaved changes.")}
          </p>
        )}
      </StickyPageBar>
      {isTemplate && (
        <p className="-mt-3 text-body text-tertiary">
          A template is never launched. Add a cycle from it, or let an automation start one for a person.
        </p>
      )}
      <FormError message={error} />

      <Card title="Basics">
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="cycle-name" required>Name</RequiredLabel>
          <Input id="cycle-name" value={draft.name} disabled={readOnly} aria-invalid={nameError ? true : undefined}
            onChange={(e) => { patch({ name: e.target.value }); setNameError(null); }} />
          {nameError && <FieldError>{nameError}</FieldError>}
        </div>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="cycle-description">Description</RequiredLabel>
          <Textarea id="cycle-description" rows={2} value={draft.description} disabled={readOnly}
            onChange={(e) => patch({ description: e.target.value })} />
        </div>
      </Card>

      <Card title="Who takes part" hint="With no conditions, everybody who works here now takes part. The list is read once, at launch.">
        <AudienceBuilder fields={fields} isLoadingFields={fieldsLoading} value={draft.filters}
          onChange={(filters) => !readOnly && patch({ filters })} />
        <div className="max-w-xs space-y-1.5">
          <RequiredLabel htmlFor="cycle-eligible">Hired on or before</RequiredLabel>
          <DatePicker id="cycle-eligible" value={draft.eligibleHiredBefore} disabled={readOnly} clearable
            onChange={(v) => patch({ eligibleHiredBefore: v })} />
          <p className="text-hint text-tertiary">Somebody hired later has not been here long enough to be reviewed.</p>
        </div>
      </Card>

      <Card title="Reviews" hint="Each review has its own form and its own window. Peers are chosen by you after launch, or nominated by each person.">
        {forms.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="divide-y divide-divider">
            {REVIEW_KINDS.map((k) => (
              <KindRow key={k} kind={k} value={draft.kinds[k]} readOnly={readOnly}
                forms={pickableForms(forms.data ?? [], draft.kinds[k].formId)}
                onChange={(p) => patchKind(k, p)} />
            ))}
          </div>
        )}
        {liveForms.length === 0 && !forms.isLoading && (
          <p className="rounded-control bg-subtle/60 px-4 py-3 text-body text-primary">
            Every review needs a form, and there are none yet.{" "}
            <Link href="/reviews/forms" className="font-medium text-accent-text underline-offset-4 hover:underline">Add one under Forms</Link>
            {" "}— blank, or from the library — and come back.
          </p>
        )}
      </Card>

      <Card title="Rating scale" hint="Every rating question of this cycle is answered on this scale, from the lowest point to the highest.">
        <ol className="space-y-2">
          {draft.scale.map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-6 text-right text-body font-medium text-tertiary">{i + 1}</span>
              <Input aria-label={`Point ${i + 1}`} value={p.label} disabled={readOnly} className="max-w-sm"
                onChange={(e) => patch({ scale: draft.scale.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
              {!readOnly && draft.scale.length > MIN_POINTS && (
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove point ${i + 1}`}
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
            Add point
          </Button>
        )}
      </Card>

      <Card title="Results" hint="The person reviewed reads their self review and their manager's. They never see peer reviews.">
        <RadioGroup value={draft.sharingMode} disabled={readOnly}
          onValueChange={(v) => patch({ sharingMode: v as CycleDraft["sharingMode"] })} className="space-y-2">
          <label className="flex items-start gap-2 text-body">
            <RadioGroupItem value="MANAGER_SHARES" className="mt-0.5" />
            <span><span className="font-medium">The manager shares</span> — each manager shares a review once theirs is in, when they are ready.</span>
          </label>
          <label className="flex items-start gap-2 text-body">
            <RadioGroupItem value="RELEASED_ON_DATE" className="mt-0.5" />
            <span><span className="font-medium">Released on a date</span> — every review whose manager review is in is shared on one day.</span>
          </label>
        </RadioGroup>
        {draft.sharingMode === "RELEASED_ON_DATE" && (
          <div className="max-w-xs space-y-1.5">
            <RequiredLabel htmlFor="cycle-release" required>Release date</RequiredLabel>
            <DatePicker id="cycle-release" value={draft.releaseDate} disabled={readOnly}
              onChange={(v) => patch({ releaseDate: v })} />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <RequiredLabel htmlFor="cycle-approval">Approval of the manager review</RequiredLabel>
            <Select value={draft.approvalMode} disabled={readOnly}
              onValueChange={(v) => patch({ approvalMode: v as ReviewApprovalMode })}>
              <SelectTrigger id="cycle-approval"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(REVIEW_APPROVAL_MODE_LABELS) as ReviewApprovalMode[]).map((m) => (
                  <SelectItem key={m} value={m}>{REVIEW_APPROVAL_MODE_LABELS[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {draft.approvalMode === "PERSON" && (
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="cycle-approver" required>Approver</RequiredLabel>
              <UserPickerField id="cycle-approver" disabled={readOnly} placeholder="Select a person"
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
            A submitted manager review waits for approval before it can be shared or released. The approver may send it
            back with a comment.{draft.approvalMode === "SKIP_LEVEL"
              ? " A manager with no manager of their own has their reviews approved by the cycle's owner." : ""}
          </p>
        )}
      </Card>

      {cycle && <RepeatCycleDialog cycle={cycle} open={repeating} onCloseAction={() => setRepeating(false)} />}

      {cycle && !isTemplate && (
        <LaunchDialog cycleId={cycle.id} open={launching} onCloseAction={() => setLaunching(false)}
          onLaunchedAction={async () => {
            setLaunching(false);
            await invalidate();
            showSuccess("Cycle launched.");
            router.refresh();
          }} />
      )}

      <ConfirmDialog
        open={deleting}
        title={isTemplate ? "Delete template" : "Delete cycle"}
        confirmLabel="Delete"
        destructive
        onCancelAction={() => setDeleting(false)}
        onConfirmAction={async () => {
          if (!cycle) return null;
          const res = await deleteCycleAction(cycle.id);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setDeleting(false);
          setBaseline(draft);
          // Leave first: refetching this page's own cycle, now gone, painted "Not found" until the push landed.
          router.push("/reviews");
          await invalidate();
          return null;
        }}
      >
        <p>
          <strong>{cycle?.name}</strong> is removed.{" "}
          {isTemplate
            ? "Cycles already started from it stay; an automation that starts reviews from it is paused."
            : "It has not been launched, so nobody has been asked for anything."}
        </p>
      </ConfirmDialog>

      <ConfirmCancelModal
        isOpen={guard.pendingHref !== null}
        title="Leave without saving?"
        description="The changes to this cycle are only on this page. Leaving now discards them."
        cancelText="Stay"
        confirmText="Leave"
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
function pickableForms(all: { id: string; name: string; archivedAt?: string | null }[], chosenId: string | null | undefined) {
  return all
    .filter((f) => !f.archivedAt || f.id === chosenId)
    .map((f) => ({ id: f.id, name: f.archivedAt ? `${f.name} (Archived)` : f.name }));
}

function KindRow({ kind, value, forms, readOnly, onChange }: {
  kind: ReviewKind;
  value: KindDraft;
  forms: { id: string; name: string }[];
  readOnly: boolean;
  onChange: (p: Partial<KindDraft>) => void;
}) {
  const id = `kind-${kind.toLowerCase()}`;
  return (
    <div className="space-y-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Switch id={`${id}-on`} checked={value.enabled} disabled={readOnly} onCheckedChange={(c) => onChange({ enabled: c })}
          aria-label={REVIEW_KIND_LABELS[kind]} />
        <div>
          <Label htmlFor={`${id}-on`} className="font-medium text-primary">{REVIEW_KIND_LABELS[kind]}</Label>
          <p className="text-hint text-tertiary">{REVIEW_KIND_DESCRIPTIONS[kind]}</p>
        </div>
      </div>
      {value.enabled && (
        <div className="grid gap-3 pl-12 sm:grid-cols-3">
          <div className="space-y-1.5">
            <RequiredLabel htmlFor={`${id}-form`} required>Form</RequiredLabel>
            <Select value={value.formId ?? ""} disabled={readOnly} onValueChange={(v) => onChange({ formId: v })}>
              <SelectTrigger id={`${id}-form`}><SelectValue placeholder="Select a form" /></SelectTrigger>
              <SelectContent>
                {forms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <RequiredLabel htmlFor={`${id}-opens`}>Opens on</RequiredLabel>
            <DatePicker id={`${id}-opens`} value={value.opensOn} disabled={readOnly} clearable onChange={(v) => onChange({ opensOn: v })} />
          </div>
          <div className="space-y-1.5">
            <RequiredLabel htmlFor={`${id}-due`} required>Due on</RequiredLabel>
            <DatePicker id={`${id}-due`} value={value.dueOn} disabled={readOnly} onChange={(v) => onChange({ dueOn: v })} />
          </div>
          {kind === "UPWARD" && (
            <div className="space-y-1.5 sm:col-span-3">
              <NumberField id={`${id}-threshold`} label="Anonymity threshold" value={value.anonymityThreshold}
                min={ANONYMITY_THRESHOLD_MIN} max={ANONYMITY_THRESHOLD_MAX} disabled={readOnly}
                onChange={(n) => onChange({ anonymityThreshold: n })} />
              <p className="text-hint text-tertiary">
                Every direct report at launch reviews their manager, without their name. Until this many upward reviews of
                a manager are in, nobody reads them; the manager reads them in their shared review. Fixed once the cycle
                is launched.
              </p>
            </div>
          )}
          {kind === "PEER" && (
            <>
              <div className="space-y-1.5 sm:col-span-3">
                <RequiredLabel htmlFor={`${id}-mode`}>Who chooses peers</RequiredLabel>
                <Select value={value.peerMode} disabled={readOnly} onValueChange={(v) => onChange({ peerMode: v as ReviewPeerMode })}>
                  <SelectTrigger id={`${id}-mode`} className="max-w-md"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(REVIEW_PEER_MODE_LABELS) as ReviewPeerMode[]).map((m) => (
                      <SelectItem key={m} value={m}>{REVIEW_PEER_MODE_LABELS[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {value.peerMode === "SUBJECT_NOMINATES" && (
                <>
                  <div className="space-y-1.5">
                    <RequiredLabel htmlFor={`${id}-nominate`} required>Nominated by</RequiredLabel>
                    <DatePicker id={`${id}-nominate`} value={value.nominationDueOn} disabled={readOnly}
                      onChange={(v) => onChange({ nominationDueOn: v })} />
                  </div>
                  <div className="space-y-1.5">
                    <RequiredLabel htmlFor={`${id}-approve`} required>Approved by</RequiredLabel>
                    <DatePicker id={`${id}-approve`} value={value.approvalDueOn} disabled={readOnly}
                      onChange={(v) => onChange({ approvalDueOn: v })} />
                  </div>
                  <p className="text-hint text-tertiary sm:col-span-3">
                    Each person nominates their peers by the first date; their manager approves, removes or adds by the
                    second. Nominations nobody approves by then stand as sent.
                  </p>
                </>
              )}
              <NumberField id={`${id}-min`} label="Fewest peers" value={value.peerMin} disabled={readOnly} onChange={(n) => onChange({ peerMin: n })} />
              <NumberField id={`${id}-max`} label="Most peers" value={value.peerMax} disabled={readOnly} onChange={(n) => onChange({ peerMax: n })} />
              <NumberField id={`${id}-cap`} label="Peer reviews per reviewer" value={value.reviewerCap} disabled={readOnly}
                onChange={(n) => onChange({ reviewerCap: n })} />
              <label className="flex items-center gap-2 text-body sm:col-span-3">
                <Checkbox checked={value.anonymous} disabled={readOnly} onCheckedChange={(c) => onChange({ anonymous: c === true })} />
                Anonymous — nobody sees who wrote a peer review, HR included
              </label>
              {value.anonymous && (
                <div className="space-y-1.5 sm:col-span-3">
                  <NumberField id={`${id}-threshold`} label="Anonymity threshold" value={value.anonymityThreshold}
                    min={ANONYMITY_THRESHOLD_MIN} max={ANONYMITY_THRESHOLD_MAX} disabled={readOnly}
                    onChange={(n) => onChange({ anonymityThreshold: n })} />
                  <p className="text-hint text-tertiary">
                    Until this many peer reviews of a person are in, nobody reads them — the manager sees only how many
                    are waiting. Fixed once the cycle is launched.
                    {value.peerMax < value.anonymityThreshold ? " The most peers per person is below it, so their reviews would never be shown." : ""}
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
