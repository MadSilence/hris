"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/public/desact/src/components/ui/input";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/public/desact/src/components/ui/select";
import {
  TRIGGER_HINTS,
  TRIGGER_LABELS,
  triggerSentence,
  type AutomationCatalog,
  type AutomationDefinition,
  type AutomationTriggerType,
  type TriggerDirection,
  type TriggerSpec,
} from "@/models/automations";
import { defaultTrigger } from "./draft";
import { Field, SentenceCard } from "./SentenceCard";

const DIRECTIONS: { value: TriggerDirection; label: string }[] = [
  { value: "BEFORE", label: "Before" },
  { value: "ON", label: "On" },
  { value: "AFTER", label: "After" },
];

/** A date attribute is chosen in the same list as the built-in dates; its value carries the id. */
const ATTRIBUTE_PREFIX = "ATTRIBUTE:";
const dateValueOf = (t: TriggerSpec) => (t.field === "ATTRIBUTE" ? `${ATTRIBUTE_PREFIX}${t.attributeId ?? ""}` : t.field ?? "");

const toDays = (raw: string): number => {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/**
 * The trigger, and the moment every offset counts from. The late-data policy is a quiet advanced
 * option: the default (run late, within the window) is what the owner settled (item 14).
 */
export function WhenCard({
  definition,
  catalog,
  onChange,
}: {
  definition: AutomationDefinition;
  catalog: AutomationCatalog;
  onChange: (patch: Partial<AutomationDefinition>) => void;
}) {
  const trigger = definition.trigger;
  const [advanced, setAdvanced] = useState(definition.latePolicy === "SKIP" || definition.lateWindowDays != null);
  const setTrigger = (patch: Partial<TriggerSpec>) => onChange({ trigger: { ...trigger, ...patch } });
  const fieldIsAttribute = (trigger.field ?? "").startsWith("attr:");

  return (
    <SentenceCard word="When" summary={triggerSentence(trigger, catalog)}>
      <Field label="Trigger" htmlFor="automation-trigger" required>
        <Select
          value={trigger.type}
          onValueChange={(v) => onChange({ trigger: defaultTrigger(v as AutomationTriggerType) })}
        >
          <SelectTrigger id="automation-trigger" aria-label="Trigger" className="w-full sm:w-96">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {catalog.triggers.map((t) => (
              <SelectItem key={t} value={t}>
                {TRIGGER_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="m-0 text-xs text-muted-foreground">{TRIGGER_HINTS[trigger.type]}</p>
      </Field>

      {trigger.type === "DATE_OFFSET" && (
        <div className="flex flex-wrap items-end gap-3">
          {trigger.direction !== "ON" && (
            <Field label="Days" htmlFor="trigger-days" className="w-24">
              <Input
                id="trigger-days"
                type="number"
                min={0}
                value={String(trigger.days ?? 0)}
                onChange={(e) => setTrigger({ days: toDays(e.target.value) })}
              />
            </Field>
          )}
          <Field label="Direction" className="w-32">
            <Select value={trigger.direction ?? "BEFORE"} onValueChange={(v) => setTrigger({ direction: v as TriggerDirection })}>
              <SelectTrigger aria-label="Direction"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date" className="min-w-56 flex-1">
            <Select
              value={dateValueOf(trigger)}
              onValueChange={(v) =>
                v.startsWith(ATTRIBUTE_PREFIX)
                  ? setTrigger({ field: "ATTRIBUTE", attributeId: v.slice(ATTRIBUTE_PREFIX.length) })
                  : setTrigger({ field: v, attributeId: null })
              }
            >
              <SelectTrigger aria-label="Date"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {catalog.dateFields.filter((o) => o.value !== "ATTRIBUTE").map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
                {catalog.dateAttributes.map((o) => (
                  <SelectItem key={o.value} value={`${ATTRIBUTE_PREFIX}${o.value}`}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <label className="flex h-9 cursor-pointer items-center gap-2 text-sm text-foreground">
            <Checkbox checked={trigger.everyYear === true} onCheckedChange={(c) => setTrigger({ everyYear: c === true })} />
            Every Year
          </label>
        </div>
      )}

      {trigger.type === "FIELD_CHANGED" && (
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Field" required className="min-w-56 flex-1">
            <Select value={trigger.field ?? ""} onValueChange={(v) => setTrigger({ field: v, from: null })}>
              <SelectTrigger aria-label="Field"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {catalog.changeableFields.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          {/* A custom field's journal line carries only the new value, so "from" cannot be matched (§ 2). */}
          {!fieldIsAttribute && (
            <Field label="From" htmlFor="trigger-from" className="w-44">
              <Input id="trigger-from" value={trigger.from ?? ""} onChange={(e) => setTrigger({ from: e.target.value || null })} />
            </Field>
          )}
          <Field label="To" htmlFor="trigger-to" className="w-44">
            <Input id="trigger-to" value={trigger.to ?? ""} onChange={(e) => setTrigger({ to: e.target.value || null })} />
          </Field>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          aria-expanded={advanced}
        >
          {advanced ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          If the Date Is Already Past
        </button>
        {advanced && (
          <div className="mt-3 space-y-3 rounded-lg bg-brown-50/60 p-4">
            <RadioGroup
              value={definition.latePolicy ?? "RUN_LATE"}
              onValueChange={(v) => onChange({ latePolicy: v as AutomationDefinition["latePolicy"] })}
              className="gap-2"
            >
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <RadioGroupItem value="RUN_LATE" className="mt-0.5" />
                <span>
                  <span className="block text-foreground">Run Late</span>
                  <span className="block text-xs text-muted-foreground">Do it today, and say in the run log that it ran late.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <RadioGroupItem value="SKIP" className="mt-0.5" />
                <span>
                  <span className="block text-foreground">Skip</span>
                  <span className="block text-xs text-muted-foreground">Leave it out — a dated email sent days late can be worse than none.</span>
                </span>
              </label>
            </RadioGroup>
            <Field
              label="How Late Is Too Late (Days)"
              htmlFor="late-window"
              className="w-56"
              hint={`Older than this is skipped either way, so an import does not send a welcome to everyone. Default ${catalog.defaultLateWindowDays}.`}
            >
              <Input
                id="late-window"
                type="number"
                min={0}
                value={definition.lateWindowDays == null ? "" : String(definition.lateWindowDays)}
                onChange={(e) => onChange({ lateWindowDays: e.target.value === "" ? null : toDays(e.target.value) })}
              />
            </Field>
          </div>
        )}
      </div>
    </SentenceCard>
  );
}
