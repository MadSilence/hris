"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import type { AutomationCatalog, StepSpec, Timing } from "@/models/automations";
import { CompactPick } from "../conditions/chrome";
import { AddConditionButton } from "@/components/audience/ConditionChrome";
import { ConditionBuilder } from "../conditions/ConditionBuilder";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { dependants, numbers, offersIfFails } from "../../model/tree";
import { Field, FieldStack, Hint, Indented, TimeInput } from "../parts/parts";
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
 * the step runs; and, on a step that can fail, If it fails. Right away keeps what Later held until it is saved (the spec), so switching back loses nothing.
 */
export const CommonFields: React.FC<Pick<StepPartProps, "definition" | "step" | "catalog" | "problems" | "onStep">> = ({ definition, step, catalog, problems, onStep }) => {
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
          className="gap-2.5"
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
                <span className="text-body text-secondary">{t("when.personZone")}</span>
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

      {offersIfFails(step) && <IfFailsField definition={definition} step={step} onStep={onStep} />}
    </FieldStack>
  );
};

/**
 * "If it fails" (S8, S8b, S8c): stop and tell the owner — what a failure always did — or skip the step and go on. With
 * Skip, a Wait until on this step is named: it is skipped too (S8c).
 */
const IfFailsField: React.FC<Pick<StepPartProps, "definition" | "step" | "onStep">> = ({ definition, step, onStep }) => {
  const t = useTranslations("automationsSettings");
  const id = React.useId();
  const skip = step.ifFails === "SKIP";
  const numbered = numbers(definition);
  const waiting = skip ? dependants(definition, step.id) : [];
  return (
    <Field label={t("ifFails.label")} labelId={id}>
      <RadioGroup
        value={skip ? "SKIP" : "STOP_AND_TELL"}
        // The default is not written: a step saved before "If it fails" existed reads the same.
        onValueChange={(v) => onStep({ ifFails: v === "SKIP" ? "SKIP" : null })}
        aria-labelledby={id}
        className="gap-3"
      >
        {(["STOP_AND_TELL", "SKIP"] as const).map((value) => (
          <label key={value} className="flex cursor-pointer items-start gap-2.5">
            <RadioGroupItem value={value} className="mt-0.5" />
            <span className="flex flex-col gap-0.5">
              <span className="text-body">{t(`ifFails.${value}`)}</span>
              <Hint>{t(`ifFails.${value}Hint`)}</Hint>
            </span>
          </label>
        ))}
      </RadioGroup>
      {waiting.map((w) => (
        <div key={w.id} role="note" className="mt-3 ml-[26px] flex items-start gap-2 rounded-control bg-status-pending-bg px-2.5 py-2">
          <Icon icon={Alert02Icon} size="sm" className="mt-px size-3.5 shrink-0 text-status-pending-icon" />
          <span className="text-hint text-status-pending-text">{t("ifFails.dependant", { number: numbered[w.id] ?? "" })}</span>
        </div>
      ))}
    </Field>
  );
};

export type { StepSpec };
