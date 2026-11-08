"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/desact/switch";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { DatePicker } from "@/components/ui/DatePicker";
import { useShortDates } from "@/lib/date";
import type { AutomationDefinition, DateField } from "@/models/automations";
import { CompactPick, type PickOption } from "../conditions/chrome";
import { DaysInput, Field, FieldStack, Hint, Indented, MistNote, PartDivider } from "../parts/parts";
import { RelativeDays } from "../parts/RelativeDays";
import { errorFor } from "../parts/problems";
import { fixedRunDate } from "./fixedRunDate";
import type { TriggerPartProps } from "./triggerPartProps";

const PERSON_DATES = ["HIRE_DATE", "PROBATION_END", "LAST_WORKING_DAY", "DATE_OF_BIRTH"] as const;
type PersonDate = (typeof PERSON_DATES)[number];
const isPersonDate = (v: string): v is PersonDate => (PERSON_DATES as readonly string[]).includes(v);

const ATTRIBUTE = "ATTRIBUTE:";

/**
 * A related date comes up (T1, T1b) and Pick a date (T1c, T1d): which date, how many days before or after it or on
 * the day, every year or once, and — not for a picked date — what happens when the date has already passed (the
 * automation's `latePolicy` and `lateWindowDays`).
 */
export const DateTriggerFields: React.FC<TriggerPartProps> = ({ definition, trigger, catalog, problems, onTrigger, onDefinition }) => {
  const t = useTranslations("automationsSettings");
  const tA = useTranslations("automations");
  const short = useShortDates();
  const labelId = React.useId();
  const whenId = React.useId();
  const lastDirection = React.useRef<"BEFORE" | "AFTER">(trigger.direction === "AFTER" ? "AFTER" : "BEFORE");

  const fixed = trigger.field === "FIXED";
  const selected = trigger.field === "ATTRIBUTE" ? `${ATTRIBUTE}${trigger.attributeId ?? ""}` : trigger.field ?? null;
  const gone = trigger.field === "ATTRIBUTE" && !catalog.dateAttributes.some((a) => a.value === trigger.attributeId);

  const options: PickOption[] = [
    ...(catalog.dateFields.length ? catalog.dateFields : PERSON_DATES.map((v) => ({ value: v, label: null })))
      .filter((o) => isPersonDate(o.value))
      .map((o) => ({ value: o.value, label: tA(`dateField.${o.value as PersonDate}`), group: t("date.aboutPerson") })),
    ...catalog.dateAttributes.map((a) => ({
      value: `${ATTRIBUTE}${a.value}`,
      label: a.label ?? a.value,
      group: t("date.companyFields"),
      custom: true,
    })),
  ];

  const pickDate = (value: string) => {
    if (value.startsWith(ATTRIBUTE)) {
      onTrigger({ field: "ATTRIBUTE", attributeId: value.slice(ATTRIBUTE.length), date: null });
    } else {
      onTrigger({ field: value as DateField, attributeId: null, date: null });
    }
  };

  const onDay = trigger.direction === "ON";
  const setLate = (patch: Partial<Pick<AutomationDefinition, "latePolicy" | "lateWindowDays">>) =>
    onDefinition({ ...definition, ...patch });
  const latePolicy = definition.latePolicy ?? "RUN_LATE";

  const dateError = gone
    ? t("problems.removed")
    : errorFor(t, problems, "trigger.field") ?? errorFor(t, problems, "trigger.attributeId");

  return (
    <FieldStack>
      <Field label={t("date.label")} labelId={labelId} required error={dateError}>
        <CompactPick
          size="md"
          options={options}
          value={fixed ? null : selected}
          triggerLabel={fixed ? tA("dateField.FIXED") : gone ? null : undefined}
          onChange={pickDate}
          placeholder={t("date.pick")}
          emptyLabel={t("common.noFieldsMatch")}
          ariaLabel={t("date.label")}
          pinned={{ label: tA("dateField.FIXED"), onSelect: () => onTrigger({ field: "FIXED", attributeId: null, everyYear: false, direction: "ON" }) }}
        />
      </Field>
      {fixed && (
        <Field error={errorFor(t, problems, "trigger.date")}>
          <DatePicker
            value={trigger.date ?? ""}
            onChange={(date) => onTrigger({ date: date || null })}
            ariaLabel={t("date.theDate")}
            clearable={false}
            invalid={Boolean(errorFor(t, problems, "trigger.date"))}
          />
        </Field>
      )}

      <Field label={t("date.when")} labelId={whenId} error={errorFor(t, problems, "trigger.days")}>
        <RelativeDays
          days={trigger.days}
          direction={onDay ? null : trigger.direction === "AFTER" ? "AFTER" : "BEFORE"}
          onDays={(days) => onTrigger({ days })}
          onDirection={(direction) => {
            lastDirection.current = direction;
            onTrigger({ direction });
          }}
          onTheDay={{
            checked: onDay,
            onChange: (checked) => onTrigger({ direction: checked ? "ON" : lastDirection.current }),
          }}
          invalid={Boolean(errorFor(t, problems, "trigger.days"))}
        />
      </Field>

      {fixed ? (
        trigger.date ? <MistNote>{t("date.runsOnce", { date: short.date(fixedRunDate(trigger)!, { weekday: true }) })}</MistNote> : null
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <label htmlFor={`${labelId}-year`} className="text-label">
                {t("date.everyYear")}
              </label>
              <Hint>{t("date.everyYearHint")}</Hint>
            </div>
            <Switch id={`${labelId}-year`} checked={trigger.everyYear === true} onCheckedChange={(everyYear) => onTrigger({ everyYear })} />
          </div>

          <PartDivider />

          <Field label={t("date.passed")}>
            <RadioGroup
              value={latePolicy}
              onValueChange={(v) => setLate({ latePolicy: v === "SKIP" ? "SKIP" : "RUN_LATE" })}
              aria-label={t("date.passed")}
              className="gap-3"
            >
              <div className="flex flex-col gap-2.5">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <RadioGroupItem value="RUN_LATE" className="mt-0.5" />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-body">{t("date.runLate")}</span>
                    <Hint>{t("date.runLateHint")}</Hint>
                  </span>
                </label>
                {latePolicy === "RUN_LATE" && (
                  <Indented>
                    <Field label={t("date.lateWindow")} error={errorFor(t, problems, "lateWindowDays")}>
                      <DaysInput
                        value={definition.lateWindowDays ?? catalog.defaultLateWindowDays}
                        onChange={(lateWindowDays) => setLate({ lateWindowDays })}
                        aria-label={t("date.lateWindow")}
                      />
                    </Field>
                  </Indented>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2.5">
                <RadioGroupItem value="SKIP" />
                <span className="text-body">{t("date.skip")}</span>
              </label>
            </RadioGroup>
          </Field>
        </>
      )}
    </FieldStack>
  );
};
