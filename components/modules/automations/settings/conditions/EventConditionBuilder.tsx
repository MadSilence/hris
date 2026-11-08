"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/desact/input";
import type { EventCondition } from "@/models/automations";
import { AddConditionButton, CompactMultiPick, CompactPick, ConditionCard, ConditionGroup, ConditionJoiner } from "./chrome";
import {
  blankGroup,
  blankLeaf,
  fieldKind,
  fromTree,
  opsFor,
  toTree,
  type EventGroup,
  type EventItem,
  type EventLeaf,
  type EventOp,
} from "./eventConditionModel";
import type { SettingsTranslator } from "../parts/problems";

export type EventFieldDef = { name: string; type: string };

const EVENT_FIELDS = ["leaveType", "policy", "days", "startsInDays", "processType", "template", "daysToComplete"] as const;
type KnownEventField = (typeof EVENT_FIELDS)[number];
const isKnown = (n: string): n is KnownEventField => (EVENT_FIELDS as readonly string[]).includes(n);

/** An event field's name: the shared catalogue's, or the field's own key when a newer backend sends one we lack. */
export const useEventFieldLabel = () => {
  const tA = useTranslations("automations");
  return (name: string) => (isKnown(name) ? tA(`eventField.${name}`) : name);
};

const LIST_VALUES = ["PREBOARDING", "ONBOARDING", "OFFBOARDING"] as const;
type KnownListValue = (typeof LIST_VALUES)[number];

/** A value of a listed field ("ONBOARDING") in words. */
export const eventValueLabel = (t: SettingsTranslator, value: string): string =>
  (LIST_VALUES as readonly string[]).includes(value) ? t(`processType.${value as KnownListValue}`) : value;

/**
 * "Only when" of a time-off or process trigger (T3, T6): the same look as `ConditionBuilder`, over the event's own
 * fields (the catalogue's `events[].fields`), writing the `EventCondition` tree — which, unlike a segment, has And /
 * Or and groups, so both are drawn.
 */
export const EventConditionBuilder: React.FC<{
  value: EventCondition | null | undefined;
  fields: EventFieldDef[];
  onChange: (value: EventCondition | null) => void;
  /** Start with one condition whose field list is open — "Add a condition" was just pressed. */
  autoOpen?: boolean;
}> = ({ value, fields, onChange, autoOpen = false }) => {
  const t = useTranslations("automationsSettings");
  const [root, setRoot] = React.useState<EventGroup>(() => {
    const seeded = fromTree(value);
    return autoOpen && seeded.items.length === 0 ? { ...seeded, items: [blankLeaf()] } : seeded;
  });
  const [openLeaf, setOpenLeaf] = React.useState<number | null>(() => (autoOpen && root0(root) ? root0(root) : null));
  const emitted = React.useRef<string>(JSON.stringify(value ?? null));

  React.useEffect(() => {
    const incoming = JSON.stringify(value ?? null);
    if (incoming !== emitted.current) {
      emitted.current = incoming;
      setRoot(fromTree(value));
    }
  }, [value]);

  const commit = (next: EventGroup) => {
    setRoot(next);
    const tree = toTree(next);
    emitted.current = JSON.stringify(tree);
    onChange(tree);
  };

  const replace = (group: EventGroup, id: number, f: (item: EventItem) => EventItem | null): EventGroup => ({
    ...group,
    items: group.items.flatMap((item) => {
      if (item.id === id) {
        const out = f(item);
        return out ? [out] : [];
      }
      return item.kind === "group" ? [replace(item, id, f)] : [item];
    }),
  });

  const addLeaf = (groupId: number) => {
    const leaf = blankLeaf();
    setOpenLeaf(leaf.id);
    const append = (g: EventGroup): EventGroup =>
      g.id === groupId ? { ...g, items: [...g.items, leaf] } : { ...g, items: g.items.map((i) => (i.kind === "group" ? append(i) : i)) };
    setRoot(append(root));
  };
  const addGroup = () => {
    const leaf = blankLeaf();
    setOpenLeaf(leaf.id);
    setRoot({ ...root, items: [...root.items, blankGroup(root.joiner === "AND" ? "OR" : "AND", [leaf])] });
  };

  const renderItems = (group: EventGroup, nested: boolean) => (
    <ConditionGroup nested={nested}>
      {group.items.map((item, i) => (
        <React.Fragment key={item.id}>
          {i > 0 && (
            <ConditionJoiner
              value={group.joiner}
              onChange={(joiner) => commit(group.id === root.id ? { ...root, joiner } : replace(root, group.id, (g) => ({ ...(g as EventGroup), joiner })))}
            />
          )}
          {item.kind === "group" ? (
            renderItems(item, true)
          ) : (
            <LeafCard
              leaf={item}
              fields={fields}
              autoOpen={openLeaf === item.id}
              onChange={(next) => commit(replace(root, item.id, () => next))}
              onRemove={() =>
                commit(
                  // A group left empty goes with its last condition.
                  pruneEmpty(replace(root, item.id, () => null)),
                )
              }
            />
          )}
        </React.Fragment>
      ))}
      <div className="flex flex-wrap gap-1">
        {group.items.every((i) => i.kind === "group" || i.field) && (
          <AddConditionButton onClick={() => addLeaf(group.id)}>{t("conditions.add")}</AddConditionButton>
        )}
        {!nested && group.items.length > 0 && (
          <AddConditionButton onClick={addGroup}>{t("conditions.addGroup")}</AddConditionButton>
        )}
      </div>
    </ConditionGroup>
  );

  return renderItems(root, false);
};

/** The first condition of a fresh group, when it has no field yet — the one to open. */
const root0 = (g: EventGroup): number | null => {
  const first = g.items[0];
  return first && first.kind === "leaf" && !first.field ? first.id : null;
};

const pruneEmpty = (g: EventGroup): EventGroup => ({
  ...g,
  items: g.items
    .map((i) => (i.kind === "group" ? pruneEmpty(i) : i))
    .filter((i) => i.kind === "leaf" || i.items.length > 0),
});

const LeafCard: React.FC<{
  leaf: EventLeaf;
  fields: EventFieldDef[];
  autoOpen: boolean;
  onChange: (leaf: EventLeaf) => void;
  onRemove: () => void;
}> = ({ leaf, fields, autoOpen, onChange, onRemove }) => {
  const t = useTranslations("automationsSettings");
  const label = useEventFieldLabel();
  const def = fields.find((f) => f.name === leaf.field) ?? null;
  const kind = def ? fieldKind(def.type) : null;
  return (
    <ConditionCard
      removeLabel={t("conditions.remove")}
      onRemove={onRemove}
      first={
        <CompactPick
          options={fields.map((f) => ({ value: f.name, label: label(f.name) }))}
          value={leaf.field || null}
          onChange={(name) => {
            const type = fields.find((f) => f.name === name)?.type ?? "TEXT";
            onChange({ ...leaf, field: name, op: opsFor(type)[0], value: "" });
          }}
          placeholder={t("conditions.pickField")}
          emptyLabel={t("common.noFieldsMatch")}
          ariaLabel={t("conditions.field")}
          defaultOpen={autoOpen}
        />
      }
      second={
        <>
          <div className="w-28 shrink-0">
            <CompactPick
              options={def ? opsFor(def.type).map((op) => ({ value: op, label: t(`eventOperator.${op}`) })) : []}
              value={leaf.op}
              onChange={(op) => onChange({ ...leaf, op: op as EventOp, value: op === "in" || leaf.op === "in" ? "" : leaf.value })}
              placeholder={t("conditions.is")}
              emptyLabel={t("conditions.noValues")}
              ariaLabel={t("conditions.operator")}
              disabled={!def}
            />
          </div>
          {kind?.kind === "list" ? (
            leaf.op === "in" ? (
              <CompactMultiPick
                options={kind.values.map((v) => ({ value: v, label: eventValueLabel(t, v) }))}
                values={leaf.value ? leaf.value.split(",").map((v) => v.trim()) : []}
                onChange={(values) => onChange({ ...leaf, value: values.join(",") })}
                placeholder={t("conditions.pickValue")}
                emptyLabel={t("conditions.noValues")}
                ariaLabel={t("conditions.value")}
              />
            ) : (
              <div className="min-w-28 flex-1">
                <CompactPick
                  options={kind.values.map((v) => ({ value: v, label: eventValueLabel(t, v) }))}
                  value={leaf.value || null}
                  onChange={(value) => onChange({ ...leaf, value })}
                  placeholder={t("conditions.pickValue")}
                  emptyLabel={t("conditions.noValues")}
                  ariaLabel={t("conditions.value")}
                />
              </div>
            )
          ) : (
            <Input
              className="h-7 min-w-20 flex-1 text-label"
              inputMode={kind?.kind === "number" ? "decimal" : undefined}
              value={leaf.value}
              disabled={!def}
              aria-label={t("conditions.value")}
              onChange={(e) =>
                onChange({ ...leaf, value: kind?.kind === "number" ? e.target.value.replace(/[^0-9.,-]/g, "") : e.target.value })
              }
            />
          )}
        </>
      }
    />
  );
};
