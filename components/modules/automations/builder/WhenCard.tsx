"use client";

import React, { useState } from "react";
import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { Checkbox } from "@/components/desact/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import {
  TRIGGER_HINTS,
  TRIGGER_LABELS,
  triggerSentence,
  type AutomationCatalog,
  type AutomationDefinition,
  type AutomationTriggerType,
  type TriggerDirection,
  type TriggerSpec,
  type AutomationEvent,
  type ChangeTiming,
  type EventAnchor,
  type ScheduleFrequency,
  EVENT_LABELS,
  WEEKDAY_LABELS,
} from "@/models/automations";
import { defaultTrigger } from "./draft";
import { EventConditionEditor } from "./EventConditionEditor";
import { Field, SentenceCard } from "./SentenceCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

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
        <p className="m-0 text-hint text-tertiary">{TRIGGER_HINTS[trigger.type]}</p>
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
            <SearchableSelect
              aria-label="Date"
              options={[
                ...catalog.dateFields
                  .filter((o) => o.value !== "ATTRIBUTE")
                  .map((o) => ({ value: o.value, label: o.label, group: "Built in" })),
                // Under its own heading: a company field can share a name with a built-in date ("Date of
                // birth" is both), and two equal rows read as a duplicate.
                ...catalog.dateAttributes.map((o) => ({
                  value: `${ATTRIBUTE_PREFIX}${o.value}`,
                  label: o.label,
                  group: "Company fields",
                })),
              ]}
              value={dateValueOf(trigger) || null}
              onChange={(v) => {
                if (!v) return;
                if (v.startsWith(ATTRIBUTE_PREFIX)) {
                  setTrigger({ field: "ATTRIBUTE", attributeId: v.slice(ATTRIBUTE_PREFIX.length) });
                } else {
                  setTrigger({ field: v, attributeId: null });
                }
              }}
              clearable={false}
            />
          </Field>
          <label className="flex h-9 cursor-pointer items-center gap-2 text-body text-primary">
            <Checkbox checked={trigger.everyYear === true} onCheckedChange={(c) => setTrigger({ everyYear: c === true })} />
            Every year
          </label>
        </div>
      )}

      {trigger.type === "FIELD_CHANGED" && (
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Field" required className="min-w-56 flex-1">
            <SearchableSelect
              aria-label="Field"
              options={catalog.changeableFields.map((o) => ({ value: o.value, label: o.label }))}
              value={trigger.field || null}
              onChange={(v) => v && setTrigger({ field: v, from: null })}
              clearable={false}
            />
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

      {trigger.type === "FIELD_CHANGED" && (
        <div className="space-y-2">
          <Field label="A change dated ahead fires" className="w-full sm:w-96">
            <Select value={trigger.when ?? "EFFECTIVE"} onValueChange={(v) => setTrigger({ when: v as ChangeTiming })}>
              <SelectTrigger aria-label="A change dated ahead fires"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EFFECTIVE">On the day it takes effect</SelectItem>
                <SelectItem value="RECORDED">On the day it is recorded</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="m-0 text-hint text-tertiary">
            Once, when the change happens. To give or keep something while a person is in a department or an office, use
            &quot;Someone starts matching&quot; instead — it also takes it back when they leave.
          </p>
        </div>
      )}

      {trigger.type === "EVENT" && (() => {
        const option = catalog.events?.find((e) => e.value === trigger.event);
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Event" required className="min-w-56 flex-1">
                <Select value={trigger.event ?? ""}
                  onValueChange={(v) => setTrigger({ event: v as AutomationEvent, eventConditions: null, anchor: "EVENT" })}>
                  <SelectTrigger aria-label="Event"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {(catalog.events ?? []).map((e) => <SelectItem key={e.value} value={e.value}>{EVENT_LABELS[e.value]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              {option?.countsFromLeave && (
                <Field label="Count from" className="w-56">
                  <Select value={trigger.anchor ?? "EVENT"} onValueChange={(v) => setTrigger({ anchor: v as EventAnchor })}>
                    <SelectTrigger aria-label="Count from"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EVENT">The event itself</SelectItem>
                      <SelectItem value="LEAVE_START">The first day of the leave</SelectItem>
                      <SelectItem value="LEAVE_END">The last day of the leave</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
              {trigger.anchor && trigger.anchor !== "EVENT" && (
                <>
                  {trigger.direction !== "ON" && (
                    <Field label="Days" htmlFor="event-days" className="w-24">
                      <Input id="event-days" type="number" min={0} value={String(trigger.days ?? 0)}
                        onChange={(e) => setTrigger({ days: toDays(e.target.value) })} />
                    </Field>
                  )}
                  <Field label="Direction" className="w-32">
                    <Select value={trigger.direction ?? "ON"} onValueChange={(v) => setTrigger({ direction: v as TriggerDirection })}>
                      <SelectTrigger aria-label="Direction"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIRECTIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}
            </div>
            {option && (
              <Field label="Only when the event">
                <EventConditionEditor value={trigger.eventConditions} event={option}
                  onChange={(eventConditions) => setTrigger({ eventConditions })} />
              </Field>
            )}
            {option?.countsFromLeave && trigger.anchor && trigger.anchor !== "EVENT" && (
              <p className="m-0 text-hint text-tertiary">
                A leave moved later moves these steps with it; a leave cancelled or rejected cancels them.
              </p>
            )}
          </div>
        );
      })()}

      {trigger.type === "SCHEDULE" && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="How often" className="w-44">
              <Select value={trigger.frequency ?? "WEEKLY"}
                onValueChange={(v) => {
                  const f = v as ScheduleFrequency;
                  setTrigger({ frequency: f, weekday: f === "WEEKLY" ? trigger.weekday ?? 1 : null,
                    dayOfMonth: f === "MONTHLY" || f === "QUARTERLY" ? trigger.dayOfMonth ?? 1 : null });
                }}>
                <SelectTrigger aria-label="How often"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Every day</SelectItem>
                  <SelectItem value="WEEKLY">Every week</SelectItem>
                  <SelectItem value="MONTHLY">Every month</SelectItem>
                  <SelectItem value="QUARTERLY">Every quarter</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {trigger.frequency === "WEEKLY" && (
              <Field label="On" className="w-44">
                <Select value={String(trigger.weekday ?? 1)} onValueChange={(v) => setTrigger({ weekday: Number(v) })}>
                  <SelectTrigger aria-label="Weekday"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WEEKDAY_LABELS.map((d, i) => <SelectItem key={d} value={String(i + 1)}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            )}
            {(trigger.frequency === "MONTHLY" || trigger.frequency === "QUARTERLY") && (
              <Field label="On day" className="w-44">
                <Select value={String(trigger.dayOfMonth ?? 1)} onValueChange={(v) => setTrigger({ dayOfMonth: Number(v) })}>
                  <SelectTrigger aria-label="Day of the month"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                    <SelectItem value="0">The last day</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </div>
          <p className="m-0 text-hint text-tertiary">
            In the company&apos;s time zone, for every person who matches on that day. A day the engine missed is caught up
            once, late.
          </p>
        </div>
      )}

      {trigger.type !== "SCHEDULE" && trigger.type !== "EVENT" && (
      <div>
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="flex items-center gap-1 text-hint text-tertiary hover:text-primary"
          aria-expanded={advanced}
        >
          {advanced ? <Icon icon={ArrowDown01Icon} size="sm" /> : <Icon icon={ArrowRight01Icon} size="sm" />}
          If the date Is already past
        </button>
        {advanced && (
          <div className="mt-3 space-y-3 rounded-control bg-subtle/60 p-4">
            <RadioGroup
              value={definition.latePolicy ?? "RUN_LATE"}
              onValueChange={(v) => onChange({ latePolicy: v as AutomationDefinition["latePolicy"] })}
              className="gap-2"
            >
              <label className="flex cursor-pointer items-start gap-2 text-body">
                <RadioGroupItem value="RUN_LATE" className="mt-0.5" />
                <span>
                  <span className="block text-primary">Run late</span>
                  <span className="block text-hint text-tertiary">Do it today, and say in the run log that it ran late.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-body">
                <RadioGroupItem value="SKIP" className="mt-0.5" />
                <span>
                  <span className="block text-primary">Skip</span>
                  <span className="block text-hint text-tertiary">Leave it out — a dated email sent days late can be worse than none.</span>
                </span>
              </label>
            </RadioGroup>
            <Field
              label="How late is too late (Days)"
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
      )}
    </SentenceCard>
  );
}
