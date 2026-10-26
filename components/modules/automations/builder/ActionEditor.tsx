"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/public/desact/src/components/ui/select";
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
} from "@/models/automations";
import { useAssignableOptions } from "@/components/modules/automations/shared/useAutomationNames";
import { PlaceholderTextField } from "./PlaceholderTextField";
import { Field } from "./SentenceCard";

type Props = {
  action: ActionSpec;
  index: number;
  catalog: AutomationCatalog;
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
            <SelectItem value="BEFORE">Days Before</SelectItem>
            <SelectItem value="ON">On the Day</SelectItem>
            <SelectItem value="AFTER">Days After</SelectItem>
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
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Remove recipient" onClick={onRemove}>
          <X className="h-4 w-4" />
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
          className="gap-1.5 text-muted-foreground"
          onClick={() => onChange([...recipients, { kind: kinds[0] ?? "PERSON" }])}
        >
          <Plus className="h-4 w-4" />
          Add Recipient
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

/**
 * One action, edited in place under its row — the rule stays visible above and below it (design
 * direction: the object stays in view). Each type reads only its own fields.
 */
export function ActionEditor({ action, index, catalog, onChange }: Props) {
  const set = (patch: Partial<ActionSpec>) => onChange({ ...action, ...patch });
  const kinds = catalog.recipientKinds[action.type] ?? ["PERSON", "MANAGER", "USER"];
  const placeholders = catalog.placeholders;
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
    </div>
  );
}
