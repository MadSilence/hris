"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import type { AutomationCatalog, StepSpec, Timing } from "@/models/automations";
import { AddConditionButton, CompactPick } from "../conditions/chrome";
import { ConditionBuilder } from "../conditions/ConditionBuilder";
import { Field, FieldStack, Indented, TimeInput } from "../parts/parts";
import { RelativeDays } from "../parts/RelativeDays";
import { errorFor } from "../parts/problems";
import type { StepPartProps } from "./stepPartProps";

export const PREVIOUS_STEP = "PREVIOUS_STEP";
const PERSON_DATES = ["HIRE_DATE", "PROBATION_END", "LAST_WORKING_DAY", "DATE_OF_BIRTH"] as const;
type PersonDate = (typeof PERSON_DATES)[number];

/** Later, as it opens: a day after the step before, at 09:00. */
export const laterDefaults = (when: Timing | null | undefined): Timing => ({
  mode: "LATER",
  days: when?.days ?? 1,
  direction: when?.direction ?? "AFTER",
  countedFrom: when?.countedFrom ?? PREVIOUS_STEP,
  at: when?.at ?? "09:00",
});

/** "Counted from": the step before, the person's dates, then the company's date fields (`ATTRIBUTE:<id>`). */
export const useCountedFromOptions = (catalog: Pick<AutomationCatalog, "dateFields" | "dateAttributes">) => {
  const t = useTranslations("automationsSettings");
  const tA = useTranslations("automations");
  return [
    { value: PREVIOUS_STEP, label: t("when.previousStep") },
    ...PERSON_DATES.filter((d) => !catalog.dateFields.length || catalog.dateFields.some((f) => f.value === d)).map((d: PersonDate) => ({
      value: d,
      label: tA(`dateField.${d}`),
    })),
    ...catalog.dateAttributes.map((a) => ({ value: `ATTRIBUTE:${a.value}`, label: a.label ?? a.value, custom: true })),
  ];
};

/**
 * The part every step has (S2b, S7): When — right away, or later: so many days before or after the step before or
 * one of the person's dates, at a time in each person's zone — and Only if, a condition the person must match when
 * the step runs. Right away keeps what Later held until it is saved (the spec), so switching back loses nothing.
 */
export const CommonFields: React.FC<Pick<StepPartProps, "step" | "catalog" | "problems" | "onStep">> = ({ step, catalog, problems, onStep }) => {
  const t = useTranslations("automationsSettings");
  const ids = { when: React.useId(), from: React.useId(), at: React.useId(), only: React.useId() };
  const when = step.when ?? null;
  const later = when?.mode === "LATER";
  const counted = useCountedFromOptions(catalog);
  const [adding, setAdding] = React.useState(() => Boolean(step.condition));
  const setWhen = (patch: Partial<Timing>) => onStep({ when: { ...laterDefaults(when), ...patch } });

  return (
    <FieldStack>
      <Field label={t("when.label")} labelId={ids.when} error={errorFor(t, problems, "when")}>
        <RadioGroup
          value={later ? "LATER" : "RIGHT_AWAY"}
          onValueChange={(v) => onStep({ when: v === "LATER" ? laterDefaults(when) : { ...(when ?? {}), mode: "RIGHT_AWAY" } })}
          aria-labelledby={ids.when}
        >
          <label className="flex cursor-pointer items-center gap-2.5">
            <RadioGroupItem value="RIGHT_AWAY" />
            <span className="text-body">{t("when.rightAway")}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <RadioGroupItem value="LATER" />
            <span className="text-body">{t("when.later")}</span>
          </label>
        </RadioGroup>
        {later && (
          <Indented className="mt-3">
            <RelativeDays
              days={when?.days}
              direction={when?.direction ?? "AFTER"}
              onDays={(days) => setWhen({ days })}
              onDirection={(direction) => setWhen({ direction })}
            />
            <Field label={t("when.countedFrom")} labelId={ids.from}>
              <CompactPick
                size="md"
                options={counted}
                value={when?.countedFrom ?? PREVIOUS_STEP}
                onChange={(countedFrom) => setWhen({ countedFrom })}
                placeholder={t("when.previousStep")}
                emptyLabel={t("common.noFieldsMatch")}
                ariaLabel={t("when.countedFrom")}
              />
            </Field>
            <Field label={t("when.at")} labelId={ids.at}>
              <div className="flex items-center gap-2">
                <TimeInput value={when?.at ?? "09:00"} onChange={(at) => setWhen({ at })} aria-labelledby={ids.at} />
                <span className="text-body text-tertiary">{t("when.personZone")}</span>
              </div>
            </Field>
          </Indented>
        )}
      </Field>

      <Field label={t("onlyIf.label")} labelId={ids.only}>
        {step.condition || adding ? (
          <ConditionBuilder
            value={step.condition ?? null}
            autoOpen={!step.condition}
            onEmpty={() => setAdding(false)}
            onChange={(condition) => onStep({ condition })}
          />
        ) : (
          <AddConditionButton onClick={() => setAdding(true)}>{t("conditions.add")}</AddConditionButton>
        )}
      </Field>
    </FieldStack>
  );
};

export type { StepSpec };
