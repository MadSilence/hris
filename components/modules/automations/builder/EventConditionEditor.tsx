"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import type { AutomationEventOption, EventCondition } from "@/models/automations";
import { eventFieldLabel } from "@/components/modules/automations/shared/vocabulary";

type Op = NonNullable<EventCondition["op"]>;
type FieldDef = AutomationEventOption["fields"][number];

const OPS: { value: Op; numeric?: boolean }[] = [
  { value: "eq" },
  { value: "neq" },
  { value: "in" },
  { value: "gt", numeric: true },
  { value: "gte", numeric: true },
  { value: "lt", numeric: true },
  { value: "lte", numeric: true },
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
  const t = useTranslations("automations");
  const kind: "ALL" | "ANY" = value?.kind === "ANY" ? "ANY" : "ALL";
  const items = childrenOf(value);
  const write = (nextKind: "ALL" | "ANY", nextItems: EventCondition[]) =>
    onChange(nextItems.length === 0 ? null : { kind: nextKind, children: nextItems });

  return (
    <div className="space-y-2" data-test="event-conditions">
      {items.length > 1 && (
        <GroupKind value={kind} onChange={(k) => write(k, items)} label={t("eventCondition.match")} />
      )}
      {items.map((item, i) => (
        <div key={i}>
          {item.kind === "ALL" || item.kind === "ANY" ? (
            <div className="space-y-2 rounded-control border border-divider p-3">
              <GroupKind
                value={item.kind}
                label={t("eventCondition.group")}
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
                {t("eventCondition.addToGroup")}
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
          {t("eventCondition.addCondition")}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-tertiary"
          onClick={() => write(kind, [...items, { kind: kind === "ALL" ? "ANY" : "ALL", children: [leaf(event.fields[0])] }])}>
          <Icon icon={Add01Icon} size="sm" />
          {t("eventCondition.addGroup")}
        </Button>
      </div>
      {items.length === 0 && <p className="m-0 text-hint text-tertiary">{t("eventCondition.empty")}</p>}
    </div>
  );
}

function GroupKind({ value, onChange, label }: { value: "ALL" | "ANY"; onChange: (v: "ALL" | "ANY") => void; label: string }) {
  const t = useTranslations("automations");
  return (
    <div className="flex items-center gap-2 text-body text-secondary">
      <span>{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v as "ALL" | "ANY")}>
        <SelectTrigger className="w-28" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("eventCondition.all")}</SelectItem>
          <SelectItem value="ANY">{t("eventCondition.any")}</SelectItem>
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
  const t = useTranslations("automations");
  const tCommon = useTranslations("common");
  const field = fields.find((f) => f.name === value.field);
  const numeric = field?.type === "NUMBER";
  const choices = field && field.type !== "TEXT" && field.type !== "NUMBER" ? field.type.split(",") : null;
  const ops = OPS.filter((o) => numeric || !o.numeric);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={value.field ?? ""} onValueChange={(v) => onChange({ ...leaf(fields.find((f) => f.name === v)) })}>
        <SelectTrigger className="w-44" aria-label={t("when.field")}><SelectValue placeholder={t("when.field")} /></SelectTrigger>
        <SelectContent>
          {fields.map((f) => <SelectItem key={f.name} value={f.name}>{eventFieldLabel(t, f)}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={value.op ?? "eq"} onValueChange={(v) => onChange({ ...value, op: v as Op })}>
        <SelectTrigger className="w-36" aria-label={t("eventCondition.comparison")}><SelectValue /></SelectTrigger>
        <SelectContent>
          {ops.map((o) => <SelectItem key={o.value} value={o.value}>{t(`eventCondition.op.${o.value}`)}</SelectItem>)}
        </SelectContent>
      </Select>
      {choices && value.op !== "in" ? (
        <Select value={value.value ?? ""} onValueChange={(v) => onChange({ ...value, value: v })}>
          <SelectTrigger className="w-44" aria-label={t("eventCondition.value")}><SelectValue placeholder={tCommon("actions.select")} /></SelectTrigger>
          <SelectContent>
            {choices.map((c) => <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <Input
          aria-label={t("eventCondition.value")}
          className="w-44"
          type={numeric && value.op !== "in" ? "number" : "text"}
          value={value.value ?? ""}
          onChange={(e) => onChange({ ...value, value: e.target.value })}
        />
      )}
      <Button type="button" variant="ghost" size="icon-sm" aria-label={t("eventCondition.removeCondition")} onClick={onRemove}>
        <Icon icon={Cancel01Icon} size="sm" />
      </Button>
    </div>
  );
}
