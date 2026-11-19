"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/desact/input";
import type { EventCondition } from "@/models/automations";
import { AddConditionButton, CompactMultiPick, CompactPick, ConditionCard, ConditionGroup, ConditionJoiner, PendingPick } from "./chrome";
import { blankLeaf, fieldKind, fromTree, isFlatAnd, opsFor, toTree, type EventLeaf, type EventOp } from "./eventConditionModel";
import { MistNote } from "../parts/parts";
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
 * fields (the catalogue's `events[].fields`) — a flat list joined by "and", as every condition list in automations
 * (the designers' fixes D6–D7, owner 2026-11-18). It writes the backend's `EventCondition` tree as one `ALL`. A tree
 * stored with "or" or groups loads as its comparisons in one list, with a note that saving a change joins them with
 * "and"; untouched, it is kept as stored.
 */
export const EventConditionBuilder: React.FC<{
  value: EventCondition | null | undefined;
  fields: EventFieldDef[];
  onChange: (value: EventCondition | null) => void;
  /** Start with one condition whose field list is open — "Add a condition" was just pressed. */
  autoOpen?: boolean;
  /** The last condition was removed — a caller that shows "Add a condition" in its place goes back to it. */
  onEmpty?: () => void;
}> = ({ value, fields, onChange, autoOpen = false, onEmpty }) => {
  const t = useTranslations("automationsSettings");
  const [leaves, setLeaves] = React.useState<EventLeaf[]>(() => {
    const seeded = fromTree(value);
    return autoOpen && seeded.length === 0 ? [blankLeaf()] : seeded;
  });
  const [openLeaf, setOpenLeaf] = React.useState<number | null>(() =>
    autoOpen && leaves.length === 1 && !leaves[0].field ? leaves[0].id : null,
  );
  const emitted = React.useRef<string>(JSON.stringify(value ?? null));
  const [mixed, setMixed] = React.useState(() => !isFlatAnd(value));

  React.useEffect(() => {
    const incoming = JSON.stringify(value ?? null);
    if (incoming !== emitted.current) {
      emitted.current = incoming;
      setLeaves(fromTree(value));
      setMixed(!isFlatAnd(value));
    }
  }, [value]);

  const commit = (next: EventLeaf[]) => {
    setLeaves(next);
    const tree = toTree(next);
    emitted.current = JSON.stringify(tree);
    onChange(tree);
  };

  const add = () => {
    const leaf = blankLeaf();
    setOpenLeaf(leaf.id);
    setLeaves([...leaves, leaf]);
  };
  const remove = (id: number) => {
    const next = leaves.filter((l) => l.id !== id);
    commit(next);
    if (next.length === 0) onEmpty?.();
  };

  return (
    <div className="flex flex-col gap-3">
      {mixed && <MistNote>{t("conditions.mixedNote")}</MistNote>}
      <ConditionGroup>
        {leaves.map((leaf, i) => (
          <React.Fragment key={leaf.id}>
            {i > 0 && <ConditionJoiner />}
            <LeafCard
              leaf={leaf}
              fields={fields}
              autoOpen={openLeaf === leaf.id}
              onChange={(next) => commit(leaves.map((l) => (l.id === leaf.id ? next : l)))}
              onRemove={() => remove(leaf.id)}
            />
          </React.Fragment>
        ))}
        {leaves.every((l) => l.field) && <AddConditionButton onClick={add}>{t("conditions.add")}</AddConditionButton>}
      </ConditionGroup>
    </div>
  );
};

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
  const [fieldOpen, setFieldOpen] = React.useState(autoOpen);
  const openField = () => setFieldOpen(true);
  if (!def) {
    // D5: before a field is picked, the operator and the value look like any select and open the field list.
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
            open={fieldOpen}
            onOpenChange={setFieldOpen}
          />
        }
        second={
          <>
            <div className="w-[108px] shrink-0">
              <PendingPick placeholder={t("conditions.is")} ariaLabel={t("conditions.operator")} onPress={openField} />
            </div>
            <div className="min-w-0 flex-1">
              <PendingPick placeholder={t("conditions.pickValue")} ariaLabel={t("conditions.value")} onPress={openField} />
            </div>
          </>
        }
      />
    );
  }
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
          open={fieldOpen}
          onOpenChange={setFieldOpen}
        />
      }
      second={
        <>
          <div className="w-[108px] shrink-0">
            <CompactPick
              options={def ? opsFor(def.type).map((op) => ({ value: op, label: t(`eventOperator.${op}`) })) : []}
              value={leaf.op}
              onChange={(op) => onChange({ ...leaf, op: op as EventOp, value: op === "in" || leaf.op === "in" ? "" : leaf.value })}
              placeholder={t("conditions.is")}
              emptyLabel={t("conditions.noValues")}
              ariaLabel={t("conditions.operator")}
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
              <div className="min-w-0 flex-1">
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
              className="h-7 min-w-0 flex-1 bg-card text-label"
              inputMode={kind?.kind === "number" ? "decimal" : undefined}
              value={leaf.value}
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
