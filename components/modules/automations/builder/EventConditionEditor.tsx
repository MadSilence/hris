"use client";

import React from "react";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import type { AutomationEventOption, EventCondition } from "@/models/automations";

type Op = NonNullable<EventCondition["op"]>;
type FieldDef = AutomationEventOption["fields"][number];

const OPS: { value: Op; label: string; numeric?: boolean }[] = [
  { value: "eq", label: "is" },
  { value: "neq", label: "is not" },
  { value: "in", label: "is one of" },
  { value: "gt", label: "more than", numeric: true },
  { value: "gte", label: "at least", numeric: true },
  { value: "lt", label: "less than", numeric: true },
  { value: "lte", label: "at most", numeric: true },
];

const leaf = (field: FieldDef | undefined): EventCondition => ({
  kind: "MATCH",
  field: field?.name ?? null,
  op: field?.type === "NUMBER" ? "gte" : "eq",
  value: "",
});

/** A group's children — a lone leaf at the top is shown as a group of one. */
const childrenOf = (c: EventCondition | null | undefined): EventCondition[] =>
  !c ? [] : c.kind === "MATCH" || c.kind === "NOT" ? [c] : c.children ?? [];

/**
 * The conditions on an event's own fields (A2): a group — all / any — of comparisons, and inside it one more level of
 * groups. The stored shape is the tree the backend evaluates; a text language could sit on top of it later.
 */
export function EventConditionEditor({
  value,
  event,
  onChange,
}: {
  value: EventCondition | null | undefined;
  event: AutomationEventOption;
  onChange: (next: EventCondition | null) => void;
}) {
  const kind: "ALL" | "ANY" = value?.kind === "ANY" ? "ANY" : "ALL";
  const items = childrenOf(value);
  const write = (nextKind: "ALL" | "ANY", nextItems: EventCondition[]) =>
    onChange(nextItems.length === 0 ? null : { kind: nextKind, children: nextItems });

  return (
    <div className="space-y-2" data-test="event-conditions">
      {items.length > 1 && (
        <GroupKind value={kind} onChange={(k) => write(k, items)} label="Match" />
      )}
      {items.map((item, i) => (
        <div key={i}>
          {item.kind === "ALL" || item.kind === "ANY" ? (
            <div className="space-y-2 rounded-control border border-divider p-3">
              <GroupKind
                value={item.kind}
                label="A group, matching"
                onChange={(k) => write(kind, items.map((x, j) => (j === i ? { ...item, kind: k } : x)))}
              />
              {(item.children ?? []).map((child, ci) => (
                <LeafRow
                  key={ci}
                  value={child}
                  fields={event.fields}
                  onChange={(next) => write(kind, items.map((x, j) => (j === i
                    ? { ...item, children: (item.children ?? []).map((c, k) => (k === ci ? next : c)) } : x)))}
                  onRemove={() => {
                    const rest = (item.children ?? []).filter((_, k) => k !== ci);
                    write(kind, rest.length === 0 ? items.filter((_, j) => j !== i)
                      : items.map((x, j) => (j === i ? { ...item, children: rest } : x)));
                  }}
                />
              ))}
              <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-tertiary"
                onClick={() => write(kind, items.map((x, j) => (j === i
                  ? { ...item, children: [...(item.children ?? []), leaf(event.fields[0])] } : x)))}>
                <Icon icon={Add01Icon} size="sm" />
                Add to the group
              </Button>
            </div>
          ) : (
            <LeafRow
              value={item}
              fields={event.fields}
              onChange={(next) => write(kind, items.map((x, j) => (j === i ? next : x)))}
              onRemove={() => write(kind, items.filter((_, j) => j !== i))}
            />
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-tertiary"
          onClick={() => write(kind, [...items, leaf(event.fields[0])])}>
          <Icon icon={Add01Icon} size="sm" />
          Add condition
        </Button>
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-tertiary"
          onClick={() => write(kind, [...items, { kind: kind === "ALL" ? "ANY" : "ALL", children: [leaf(event.fields[0])] }])}>
          <Icon icon={Add01Icon} size="sm" />
          Add group
        </Button>
      </div>
      {items.length === 0 && <p className="m-0 text-hint text-tertiary">Every such event, whatever its details.</p>}
    </div>
  );
}

function GroupKind({ value, onChange, label }: { value: "ALL" | "ANY"; onChange: (v: "ALL" | "ANY") => void; label: string }) {
  return (
    <div className="flex items-center gap-2 text-body text-secondary">
      <span>{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v as "ALL" | "ANY")}>
        <SelectTrigger className="w-28" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">all of</SelectItem>
          <SelectItem value="ANY">any of</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function LeafRow({
  value,
  fields,
  onChange,
  onRemove,
}: {
  value: EventCondition;
  fields: FieldDef[];
  onChange: (next: EventCondition) => void;
  onRemove: () => void;
}) {
  const field = fields.find((f) => f.name === value.field);
  const numeric = field?.type === "NUMBER";
  const choices = field && field.type !== "TEXT" && field.type !== "NUMBER" ? field.type.split(",") : null;
  const ops = OPS.filter((o) => numeric || !o.numeric);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={value.field ?? ""} onValueChange={(v) => onChange({ ...leaf(fields.find((f) => f.name === v)) })}>
        <SelectTrigger className="w-44" aria-label="Field"><SelectValue placeholder="Field" /></SelectTrigger>
        <SelectContent>
          {fields.map((f) => <SelectItem key={f.name} value={f.name}>{f.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={value.op ?? "eq"} onValueChange={(v) => onChange({ ...value, op: v as Op })}>
        <SelectTrigger className="w-36" aria-label="Comparison"><SelectValue /></SelectTrigger>
        <SelectContent>
          {ops.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {choices && value.op !== "in" ? (
        <Select value={value.value ?? ""} onValueChange={(v) => onChange({ ...value, value: v })}>
          <SelectTrigger className="w-44" aria-label="Value"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {choices.map((c) => <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <Input
          aria-label="Value"
          className="w-44"
          type={numeric && value.op !== "in" ? "number" : "text"}
          value={value.value ?? ""}
          onChange={(e) => onChange({ ...value, value: e.target.value })}
        />
      )}
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove condition" onClick={onRemove}>
        <Icon icon={Cancel01Icon} size="sm" />
      </Button>
    </div>
  );
}
