"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { Checkbox } from "@/components/desact/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import type {
  AutomationCatalog,
  AutomationDefinition,
  AutomationTriggerType,
  TriggerDirection,
  TriggerSpec,
  AutomationEvent,
  ChangeTiming,
  EventAnchor,
  ScheduleFrequency,
} from "@/models/automations";
import {
  WEEKDAY_NUMBERS,
  changeableFieldLabel,
  dateFieldLabel,
  triggerSentence,
  weekdayLabel,
} from "@/components/modules/automations/shared/vocabulary";
import { defaultTrigger } from "./draft";
import { EventConditionEditor } from "./EventConditionEditor";
import { Field, SentenceCard } from "./SentenceCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const DIRECTIONS: TriggerDirection[] = ["BEFORE", "ON", "AFTER"];
const FREQUENCIES: ScheduleFrequency[] = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"];
const ANCHORS: EventAnchor[] = ["EVENT", "LEAVE_START", "LEAVE_END"];

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
  const t = useTranslations("automations");
  const tCommon = useTranslations("common");
  const trigger = definition.trigger;
  const [advanced, setAdvanced] = useState(definition.latePolicy === "SKIP" || definition.lateWindowDays != null);
  const setTrigger = (patch: Partial<TriggerSpec>) => onChange({ trigger: { ...trigger, ...patch } });
  const fieldIsAttribute = (trigger.field ?? "").startsWith("attr:");

  return (
    <SentenceCard word={t("clause.when")} summary={triggerSentence(t, trigger, catalog)}>
      <Field label={t("when.trigger")} htmlFor="automation-trigger" required>
        <Select
          value={trigger.type}
          onValueChange={(v) => onChange({ trigger: defaultTrigger(v as AutomationTriggerType) })}
        >
          <SelectTrigger id="automation-trigger" aria-label={t("when.trigger")} className="w-full sm:w-96">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {catalog.triggers.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`trigger.label.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="m-0 text-hint text-tertiary">{t(`trigger.hint.${trigger.type}`)}</p>
      </Field>

      {trigger.type === "DATE_OFFSET" && (
        <div className="flex flex-wrap items-end gap-3">
          {trigger.direction !== "ON" && (
            <Field label={t("when.days")} htmlFor="trigger-days" className="w-24">
              <Input
                id="trigger-days"
                type="number"
                min={0}
                value={String(trigger.days ?? 0)}
                onChange={(e) => setTrigger({ days: toDays(e.target.value) })}
              />
            </Field>
          )}
          <Field label={t("when.direction")} className="w-32">
            <Select value={trigger.direction ?? "BEFORE"} onValueChange={(v) => setTrigger({ direction: v as TriggerDirection })}>
              <SelectTrigger aria-label={t("when.direction")}><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((d) => <SelectItem key={d} value={d}>{t(`when.directions.${d}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={tCommon("fields.date")} className="min-w-56 flex-1">
            <SearchableSelect
              aria-label={tCommon("fields.date")}
              options={[
                ...catalog.dateFields
                  .filter((o) => o.value !== "ATTRIBUTE")
                  .map((o) => ({ value: o.value, label: dateFieldLabel(t, o), group: t("when.groupBuiltIn") })),
                // Under its own heading: a company field can share a name with a built-in date ("Date of
                // birth" is both), and two equal rows read as a duplicate.
                ...catalog.dateAttributes.map((o) => ({
                  value: `${ATTRIBUTE_PREFIX}${o.value}`,
                  label: o.label,
                  group: t("when.groupCompany"),
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
            {t("when.everyYear")}
          </label>
        </div>
      )}

      {trigger.type === "FIELD_CHANGED" && (
        <div className="flex flex-wrap items-end gap-3">
          <Field label={t("when.field")} required className="min-w-56 flex-1">
            <SearchableSelect
              aria-label={t("when.field")}
              options={catalog.changeableFields.map((o) => ({ value: o.value, label: changeableFieldLabel(t, o) }))}
              value={trigger.field || null}
              onChange={(v) => v && setTrigger({ field: v, from: null })}
              clearable={false}
            />
          </Field>
          {/* A custom field's journal line carries only the new value, so "from" cannot be matched (§ 2). */}
          {!fieldIsAttribute && (
            <Field label={t("when.from")} htmlFor="trigger-from" className="w-44">
              <Input id="trigger-from" value={trigger.from ?? ""} onChange={(e) => setTrigger({ from: e.target.value || null })} />
            </Field>
          )}
          <Field label={t("when.to")} htmlFor="trigger-to" className="w-44">
            <Input id="trigger-to" value={trigger.to ?? ""} onChange={(e) => setTrigger({ to: e.target.value || null })} />
          </Field>
        </div>
      )}

      {trigger.type === "FIELD_CHANGED" && (
        <div className="space-y-2">
          <Field label={t("when.changeFires")} className="w-full sm:w-96">
            <Select value={trigger.when ?? "EFFECTIVE"} onValueChange={(v) => setTrigger({ when: v as ChangeTiming })}>
              <SelectTrigger aria-label={t("when.changeFires")}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EFFECTIVE">{t("when.fireEffective")}</SelectItem>
                <SelectItem value="RECORDED">{t("when.fireRecorded")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="m-0 text-hint text-tertiary">{t("when.changeHint")}</p>
        </div>
      )}

      {trigger.type === "EVENT" && (() => {
        const option = catalog.events?.find((e) => e.value === trigger.event);
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <Field label={t("when.event")} required className="min-w-56 flex-1">
                <Select value={trigger.event ?? ""}
                  onValueChange={(v) => setTrigger({ event: v as AutomationEvent, eventConditions: null, anchor: "EVENT" })}>
                  <SelectTrigger aria-label={t("when.event")}><SelectValue placeholder={tCommon("actions.select")} /></SelectTrigger>
                  <SelectContent>
                    {(catalog.events ?? []).map((e) => <SelectItem key={e.value} value={e.value}>{t(`event.label.${e.value}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              {option?.countsFromLeave && (
                <Field label={t("when.countFrom")} className="w-56">
                  <Select value={trigger.anchor ?? "EVENT"} onValueChange={(v) => setTrigger({ anchor: v as EventAnchor })}>
                    <SelectTrigger aria-label={t("when.countFrom")}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ANCHORS.map((a) => <SelectItem key={a} value={a}>{t(`when.anchor.${a}`)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              {trigger.anchor && trigger.anchor !== "EVENT" && (
                <>
                  {trigger.direction !== "ON" && (
                    <Field label={t("when.days")} htmlFor="event-days" className="w-24">
                      <Input id="event-days" type="number" min={0} value={String(trigger.days ?? 0)}
                        onChange={(e) => setTrigger({ days: toDays(e.target.value) })} />
                    </Field>
                  )}
                  <Field label={t("when.direction")} className="w-32">
                    <Select value={trigger.direction ?? "ON"} onValueChange={(v) => setTrigger({ direction: v as TriggerDirection })}>
                      <SelectTrigger aria-label={t("when.direction")}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIRECTIONS.map((d) => <SelectItem key={d} value={d}>{t(`when.directions.${d}`)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}
            </div>
            {option && (
              <Field label={t("when.onlyWhen")}>
                <EventConditionEditor value={trigger.eventConditions} event={option}
                  onChange={(eventConditions) => setTrigger({ eventConditions })} />
              </Field>
            )}
            {option?.countsFromLeave && trigger.anchor && trigger.anchor !== "EVENT" && (
              <p className="m-0 text-hint text-tertiary">{t("when.leaveMoves")}</p>
            )}
          </div>
        );
      })()}

      {trigger.type === "SCHEDULE" && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-end gap-3">
            <Field label={t("when.howOften")} className="w-44">
              <Select value={trigger.frequency ?? "WEEKLY"}
                onValueChange={(v) => {
                  const f = v as ScheduleFrequency;
                  setTrigger({ frequency: f, weekday: f === "WEEKLY" ? trigger.weekday ?? 1 : null,
                    dayOfMonth: f === "MONTHLY" || f === "QUARTERLY" ? trigger.dayOfMonth ?? 1 : null });
                }}>
                <SelectTrigger aria-label={t("when.howOften")}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{t(`when.frequency.${f}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            {trigger.frequency === "WEEKLY" && (
              <Field label={t("when.on")} className="w-44">
                <Select value={String(trigger.weekday ?? 1)} onValueChange={(v) => setTrigger({ weekday: Number(v) })}>
                  <SelectTrigger aria-label={t("when.weekday")}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WEEKDAY_NUMBERS.map((d) => <SelectItem key={d} value={String(d)}>{weekdayLabel(t, d)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            )}
            {(trigger.frequency === "MONTHLY" || trigger.frequency === "QUARTERLY") && (
              <Field label={t("when.onDay")} className="w-44">
                <Select value={String(trigger.dayOfMonth ?? 1)} onValueChange={(v) => setTrigger({ dayOfMonth: Number(v) })}>
                  <SelectTrigger aria-label={t("when.dayOfMonth")}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                    <SelectItem value="0">{t("when.lastDay")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </div>
          <p className="m-0 text-hint text-tertiary">{t("when.scheduleHint")}</p>
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
          {t("when.latePast")}
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
                  <span className="block text-primary">{t("when.runLate")}</span>
                  <span className="block text-hint text-tertiary">{t("when.runLateHint")}</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-body">
                <RadioGroupItem value="SKIP" className="mt-0.5" />
                <span>
                  <span className="block text-primary">{t("when.skip")}</span>
                  <span className="block text-hint text-tertiary">{t("when.skipHint")}</span>
                </span>
              </label>
            </RadioGroup>
            <Field
              label={t("when.lateWindow")}
              htmlFor="late-window"
              className="w-56"
              hint={t("when.lateWindowHint", { days: catalog.defaultLateWindowDays })}
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
