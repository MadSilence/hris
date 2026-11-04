"use client";

import React from "react";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useReferenceOptions } from "@/components/hooks/useReferenceOptions";
import { useUser } from "@/components/hooks/useUser/useUser";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import {
  ASSIGNABLE_LABELS,
  RECIPIENT_LABELS,
  type ActionSpec,
  type AssignableType,
  type AutomationCatalog,
  type RecipientKind,
  type RecipientSpec,
  type TriggerSpec,
  type WaitUntil,
  type OnTimeout,
  ON_TIMEOUT_LABELS,
  actionSentence,
} from "@/models/automations";
import type { FieldDTO } from "@/models/user/fields";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { emptySegment } from "@/models/segment/Segment";
import { placeholdersFor } from "./draft";
import { useAssignableOptions } from "@/components/modules/automations/shared/useAutomationNames";
import { PlaceholderTextField } from "./PlaceholderTextField";
import { Field } from "./SentenceCard";
import { StartReviewEditor } from "./StartReviewEditor";

type Props = {
  action: ActionSpec;
  index: number;
  catalog: AutomationCatalog;
  /** The rule's trigger: an event adds its placeholders and its recipients (A3, A5). */
  trigger?: TriggerSpec;
  /** The rule's actions: a wait for a task chooses one of the tasks before it (C2). */
  actions?: ActionSpec[];
  /** The person fields an "only if" filters on (C1). */
  fields?: FieldDTO[];
  isLoadingFields?: boolean;
  onChange: (next: ActionSpec) => void;
};

const toInt = (raw: string): number => {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? Math.abs(n) : 0;
};

type Side = "BEFORE" | "ON" | "AFTER";
const sideOf = (days: number) => (days === 0 ? "ON" : days < 0 ? "BEFORE" : "AFTER");

/** An offset in calendar days from the moment (owner item 12): Before / On the Day / After, and how many. */
export function OffsetField({
  id,
  label,
  value,
  onChange,
  allowEmpty = false,
}: {
  id: string;
  label: string;
  value: number | null | undefined;
  onChange: (days: number | null) => void;
  allowEmpty?: boolean;
}) {
  const empty = value == null;
  const days = value ?? 0;
  const side: Side | "NONE" = empty && allowEmpty ? "NONE" : sideOf(days);
  const setSide = (next: Side | "NONE") => {
    if (next === "NONE") return onChange(null);
    const size = Math.abs(days) || (next === "ON" ? 0 : 1);
    onChange(next === "ON" ? 0 : next === "BEFORE" ? -size : size);
  };
  return (
    <Field label={label} htmlFor={id}>
      <div className="flex items-center gap-2">
        {side !== "ON" && side !== "NONE" && (
          <Input
            id={id}
            type="number"
            min={0}
            className="w-20"
            aria-label={`${label} (days)`}
            value={String(Math.abs(days))}
            onChange={(e) => onChange(side === "BEFORE" ? -toInt(e.target.value) : toInt(e.target.value))}
          />
        )}
        <Select value={side} onValueChange={(v) => setSide(v as Side | "NONE")}>
          <SelectTrigger className="w-48" aria-label={label}><SelectValue /></SelectTrigger>
          <SelectContent>
            {allowEmpty && <SelectItem value="NONE">None</SelectItem>}
            <SelectItem value="BEFORE">Days before</SelectItem>
            <SelectItem value="ON">On the day</SelectItem>
            <SelectItem value="AFTER">Days after</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Field>
  );
}

/** A named person, shown by name when the rule was loaded with only their id. */
function NamedPersonPicker({ userId, onChange }: { userId: string | null | undefined; onChange: (id: string | null) => void }) {
  const { data: user } = useUser(userId ?? "");
  const value = userId
    ? { id: userId, firstName: user?.firstName, lastName: user?.lastName, email: user?.email, avatarUrl: user?.avatarUrl }
    : null;
  return <UserPickerField value={value} onChange={(u) => onChange(u?.id ?? null)} />;
}

function RoleSelect({ roleId, onChange }: { roleId: string | null | undefined; onChange: (id: string | null) => void }) {
  const { options, isLoading } = useReferenceOptions("roles");
  return (
    <SearchableSelect
      options={options.map((o) => ({ value: o.id, label: o.label }))}
      value={roleId ?? null}
      onChange={onChange}
      placeholder={isLoading ? "Loading…" : "Select"}
      className="w-56"
    />
  );
}

function RecipientRow({
  recipient,
  kinds,
  onChange,
  onRemove,
}: {
  recipient: RecipientSpec;
  kinds: RecipientKind[];
  onChange: (next: RecipientSpec) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={recipient.kind} onValueChange={(v) => onChange({ kind: v as RecipientKind })}>
        <SelectTrigger className="w-60" aria-label="Recipient"><SelectValue /></SelectTrigger>
        <SelectContent>
          {kinds.map((k) => <SelectItem key={k} value={k}>{RECIPIENT_LABELS[k]}</SelectItem>)}
        </SelectContent>
      </Select>
      {recipient.kind === "ROLE" && (
        <RoleSelect roleId={recipient.roleId} onChange={(roleId) => onChange({ ...recipient, roleId })} />
      )}
      {recipient.kind === "USER" && (
        <div className="w-64">
          <NamedPersonPicker userId={recipient.userId} onChange={(userId) => onChange({ ...recipient, userId })} />
        </div>
      )}
      {onRemove && (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove recipient" onClick={onRemove}>
          <Icon icon={Cancel01Icon} size="sm" />
        </Button>
      )}
    </div>
  );
}

function RecipientsField({
  recipients,
  kinds,
  onChange,
}: {
  recipients: RecipientSpec[];
  kinds: RecipientKind[];
  onChange: (next: RecipientSpec[]) => void;
}) {
  return (
    <Field label="To" required>
      <div className="space-y-2">
        {recipients.map((r, i) => (
          <RecipientRow
            key={i}
            recipient={r}
            kinds={kinds}
            onChange={(next) => onChange(recipients.map((x, j) => (j === i ? next : x)))}
            onRemove={recipients.length > 1 ? () => onChange(recipients.filter((_, j) => j !== i)) : undefined}
          />
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-tertiary"
          onClick={() => onChange([...recipients, { kind: kinds[0] ?? "PERSON" }])}
        >
          <Icon icon={Add01Icon} size="sm" />
          Add recipient
        </Button>
      </div>
    </Field>
  );
}

function TargetPicker({
  type,
  value,
  onChange,
  label,
}: {
  type: AssignableType | null | undefined;
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  label: string;
}) {
  const { options, isLoading } = useAssignableOptions(type);
  return (
    <Field label={label} required>
      <SearchableSelect
        options={options.map((o) => ({ value: o.id, label: o.label }))}
        value={value ?? null}
        onChange={onChange}
        disabled={!type}
        placeholder={isLoading ? "Loading…" : "Select"}
        className="w-full sm:w-96"
      />
    </Field>
  );
}

/** The fields a wait can watch (C2): the person's dates and links; a company field comes from the field list. */
const WAITABLE_FIELDS: { value: string; label: string }[] = [
  { value: "sys:hire_date", label: "Hire date" },
  { value: "sys:probation_end", label: "Probation end" },
  { value: "sys:termination_date", label: "Last working day" },
  { value: "sys:manager", label: "Manager" },
  { value: "sys:job", label: "Position" },
  { value: "sys:office", label: "Office" },
  { value: "sys:legal_entity", label: "Legal entity" },
  { value: "sys:department", label: "Department" },
];

/** C2: a wait and an approval always have a longest wait, and say what happens then. */
function HoldingLimits({ action, prefix, set }: { action: ActionSpec; prefix: string; set: (p: Partial<ActionSpec>) => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="At most (days)" htmlFor={`${prefix}-max`} className="w-32" required>
        <Input id={`${prefix}-max`} type="number" min={1} max={365} value={String(action.maxDays ?? "")}
          onChange={(e) => set({ maxDays: e.target.value === "" ? null : toInt(e.target.value) })} />
      </Field>
      <Field label="Then" className="w-64">
        <Select value={action.onTimeout ?? "STOP_AND_TELL"} onValueChange={(v) => set({ onTimeout: v as OnTimeout })}>
          <SelectTrigger aria-label="Then"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(ON_TIMEOUT_LABELS) as OnTimeout[]).map((k) => <SelectItem key={k} value={k}>{ON_TIMEOUT_LABELS[k]}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

/** C1: "only if" — a condition on the person checked when this step runs; false skips it, the rest goes on. */
function OnlyIf({ action, fields, isLoadingFields, set }: {
  action: ActionSpec;
  fields?: FieldDTO[];
  isLoadingFields: boolean;
  set: (p: Partial<ActionSpec>) => void;
}) {
  const on = action.condition != null;
  return (
    <div className="space-y-2 border-t border-divider pt-3">
      <label className="flex cursor-pointer items-center gap-2 text-body text-primary">
        <input type="checkbox" checked={on} onChange={(e) => set({ condition: e.target.checked ? emptySegment() : null })} />
        Only if…
      </label>
      {on && action.condition && (
        <>
          <AudienceBuilder
            fields={fields}
            isLoadingFields={isLoadingFields}
            value={action.condition.filters}
            onChange={(filters) => set({ condition: { ...action.condition!, filters } })}
          />
          <p className="m-0 text-hint text-tertiary">Checked on the day this step runs. When it does not hold, this step is skipped and the rest goes on.</p>
        </>
      )}
    </div>
  );
}

/**
 * One action, edited in place under its row — the rule stays visible above and below it (design
 * direction: the object stays in view). Each type reads only its own fields.
 */
export function ActionEditor({ action, index, catalog, trigger, actions = [], fields, isLoadingFields = false, onChange }: Props) {
  const set = (patch: Partial<ActionSpec>) => onChange({ ...action, ...patch });
  const event = trigger?.type === "EVENT" ? catalog.events?.find((e) => e.value === trigger.event) : undefined;
  const kinds: RecipientKind[] = [...(catalog.recipientKinds[action.type] ?? ["PERSON", "MANAGER", "USER"]),
    ...(event?.recipientKinds ?? [])];
  const placeholders = trigger ? placeholdersFor(catalog, trigger) : catalog.placeholders;
  const taskSteps = actions.map((a, i) => ({ a, i })).filter(({ a, i }) => a.type === "CREATE_TASK" && i < index);
  const assignTypes = catalog.assignableTypes.filter((t) => t !== "TIME_OFF_POLICY");
  const prefix = `action-${index}`;

  return (
    <div className="space-y-4">
      <OffsetField
        id={`${prefix}-offset`}
        label="When"
        value={action.offsetDays ?? 0}
        onChange={(days) => set({ offsetDays: days ?? 0 })}
      />

      {(action.type === "SEND_EMAIL" || action.type === "NOTIFY") && (
        <RecipientsField
          recipients={action.recipients?.length ? action.recipients : [{ kind: kinds[0] ?? "PERSON" }]}
          kinds={kinds}
          onChange={(recipients) => set({ recipients })}
        />
      )}

      {action.type === "SEND_EMAIL" && (
        <>
          <PlaceholderTextField
            id={`${prefix}-subject`}
            label="Subject"
            required
            value={action.subject ?? ""}
            onChange={(subject) => set({ subject })}
            placeholders={placeholders}
          />
          <PlaceholderTextField
            id={`${prefix}-body`}
            label="Message"
            required
            multiline
            value={action.body ?? ""}
            onChange={(body) => set({ body })}
            placeholders={placeholders}
          />
        </>
      )}

      {action.type === "NOTIFY" && (
        <PlaceholderTextField
          id={`${prefix}-text`}
          label="Message"
          required
          multiline
          value={action.text ?? ""}
          onChange={(text) => set({ text })}
          placeholders={placeholders}
        />
      )}

      {action.type === "CREATE_TASK" && (
        <>
          <Field label="Assignee" required>
            <RecipientRow
              recipient={action.assignee ?? { kind: kinds[0] ?? "MANAGER" }}
              kinds={kinds}
              onChange={(assignee) => set({ assignee })}
            />
          </Field>
          <PlaceholderTextField
            id={`${prefix}-title`}
            label="Title"
            required
            value={action.title ?? ""}
            onChange={(title) => set({ title })}
            placeholders={placeholders}
          />
          <PlaceholderTextField
            id={`${prefix}-description`}
            label="Description"
            multiline
            value={action.description ?? ""}
            onChange={(description) => set({ description })}
            placeholders={placeholders}
          />
          <OffsetField
            id={`${prefix}-due`}
            label="Due"
            allowEmpty
            value={action.dueOffsetDays}
            onChange={(dueOffsetDays) => set({ dueOffsetDays })}
          />
        </>
      )}

      {(action.type === "ASSIGN" || action.type === "UNASSIGN") && (
        <div className="flex flex-wrap items-end gap-3">
          <Field label="What" required className="w-56">
            <Select
              value={action.assignableType ?? ""}
              onValueChange={(v) => set({ assignableType: v as AssignableType, assignableId: null })}
            >
              <SelectTrigger aria-label="What"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {assignTypes.map((t) => <SelectItem key={t} value={t}>{ASSIGNABLE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="min-w-64 flex-1">
            <TargetPicker
              type={action.assignableType}
              value={action.assignableId}
              onChange={(assignableId) => set({ assignableId })}
              label={action.assignableType ? ASSIGNABLE_LABELS[action.assignableType] : "Target"}
            />
          </div>
        </div>
      )}

      {action.type === "GRANT_TIME_OFF_POLICY" && (
        <TargetPicker
          type="TIME_OFF_POLICY"
          value={action.policyId}
          onChange={(policyId) => set({ policyId })}
          label="Policy"
        />
      )}

      {action.type === "START_REVIEW" && <StartReviewEditor action={action} prefix={prefix} onChange={set} />}

      {action.type === "WAIT_UNTIL" && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Until" required className="w-56">
              <Select value={action.until ?? "TASK_DONE"} onValueChange={(v) => set({ until: v as WaitUntil, taskStep: null, field: null })}>
                <SelectTrigger aria-label="Until"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK_DONE">A task of this rule is done</SelectItem>
                  <SelectItem value="FIELD_FILLED">A field is filled</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {(action.until ?? "TASK_DONE") === "TASK_DONE" ? (
              <Field label="Task" required className="min-w-64 flex-1">
                <Select value={action.taskStep == null ? "" : String(action.taskStep)} onValueChange={(v) => set({ taskStep: Number(v) })}>
                  <SelectTrigger aria-label="Task"><SelectValue placeholder={taskSteps.length ? "Select" : "Add a task before this wait"} /></SelectTrigger>
                  <SelectContent>
                    {taskSteps.map(({ a, i }) => <SelectItem key={i} value={String(i)}>{`${i + 1}. ${actionSentence(a)}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <Field label="Field" required className="min-w-64 flex-1">
                <SearchableSelect
                  aria-label="Field"
                  options={WAITABLE_FIELDS.concat((fields ?? []).filter((f) => f.key?.startsWith("attr:"))
                    .map((f) => ({ value: f.key, label: f.label ?? f.key })))}
                  value={action.field ?? null}
                  onChange={(v) => set({ field: v })}
                />
              </Field>
            )}
          </div>
          <HoldingLimits action={action} prefix={prefix} set={set} />
        </>
      )}

      {action.type === "REQUEST_APPROVAL" && (
        <>
          <Field label="Who approves" required>
            <RecipientRow
              recipient={action.assignee ?? { kind: "MANAGER" }}
              kinds={kinds}
              onChange={(assignee) => set({ assignee })}
            />
          </Field>
          <PlaceholderTextField
            id={`${prefix}-approval-title`}
            label="What is asked"
            required
            value={action.title ?? ""}
            onChange={(title) => set({ title })}
            placeholders={placeholders}
          />
          <PlaceholderTextField
            id={`${prefix}-approval-description`}
            label="Description"
            multiline
            value={action.description ?? ""}
            onChange={(description) => set({ description })}
            placeholders={placeholders}
          />
          <p className="m-0 text-hint text-tertiary">
            The approver gets a task with Approve and Decline. The steps after this one wait for the answer; a decline stops them.
          </p>
          <HoldingLimits action={action} prefix={prefix} set={set} />
        </>
      )}

      <OnlyIf action={action} fields={fields} isLoadingFields={isLoadingFields} set={set} />
    </div>
  );
}
