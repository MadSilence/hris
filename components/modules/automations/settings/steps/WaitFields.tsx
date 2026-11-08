"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import type { OnTimeout, StepSpec } from "@/models/automations";
import { numbers, stepsAbove } from "../../model/tree";
import { CompactPick } from "../conditions/chrome";
import { PeoplePicker } from "../people/PeoplePicker";
import { usePlaceholderLabel } from "../tokens/TokenTextField";
import { tokensAsWords } from "../tokens/tokens";
import { DaysInput, Field, FieldStack, Hint, Indented } from "../parts/parts";
import { errorFor } from "../parts/problems";
import type { StepPartProps } from "./stepPartProps";

/** The fields a wait can wait for (hris-api `AutomationWaits.FILLABLE`), then the company's own. */
export const FILLABLE = [
  "sys:hire_date",
  "sys:probation_end",
  "sys:termination_date",
  "sys:manager",
  "sys:job",
  "sys:office",
  "sys:legal_entity",
  "sys:department",
] as const;
type Fillable = (typeof FILLABLE)[number];
const FILLABLE_KEY: Record<Fillable, "hireDate" | "probationEnd" | "terminationDate" | "manager" | "job" | "office" | "legalEntity" | "department"> = {
  "sys:hire_date": "hireDate",
  "sys:probation_end": "probationEnd",
  "sys:termination_date": "terminationDate",
  "sys:manager": "manager",
  "sys:job": "job",
  "sys:office": "office",
  "sys:legal_entity": "legalEntity",
  "sys:department": "department",
};

/** A fillable field's name. */
export const useFillableLabel = (catalog: StepPartProps["catalog"]) => {
  const t = useTranslations("automationsSettings");
  return (field: string | null | undefined): string => {
    if (!field) return "";
    if ((FILLABLE as readonly string[]).includes(field)) return t(`wait.fields.${FILLABLE_KEY[field as Fillable]}`);
    return catalog.changeableFields.find((f) => f.value === field)?.label ?? field;
  };
};

const TIMEOUTS: OnTimeout[] = ["CONTINUE", "STOP", "STOP_AND_TELL"];

/** The task steps above a wait on its own line, nearest first, each by its number and title. */
export const useTaskStepsAbove = (definition: StepPartProps["definition"], step: StepSpec) => {
  const t = useTranslations("automationsSettings");
  const label = usePlaceholderLabel();
  const n = numbers(definition);
  return stepsAbove(definition, step.id)
    .filter((s) => s.type === "CREATE_TASK")
    .map((s) => ({
      value: s.id,
      label: t("wait.taskOption", { number: n[s.id] ?? "", title: tokensAsWords(s.title, label) || t("wait.untitledTask") }),
    }));
};

/**
 * Wait until (S3, S4): a task from this run is done — one of the task steps above it, disabled with a hint when there
 * is none — or a field is filled; at most so many days; and what happens if it's not done by then, with whom to tell.
 */
export const WaitFields: React.FC<StepPartProps> = ({ definition, step, catalog, problems, onStep, event }) => {
  const t = useTranslations("automationsSettings");
  const fieldLabel = useFillableLabel(catalog);
  const tasks = useTaskStepsAbove(definition, step);
  const ids = { wait: React.useId(), tell: React.useId() };
  // With no task above, a wait can only be for a field: shown so, and written so with the field's pick.
  const until = tasks.length === 0 ? "FIELD_FILLED" : step.until ?? "TASK_DONE";
  const timeout = step.onTimeout ?? "STOP_AND_TELL";
  const fillable = [
    ...FILLABLE.map((f) => ({ value: f as string, label: fieldLabel(f) })),
    ...catalog.changeableFields
      .filter((f) => f.value.startsWith("attr:"))
      .map((f) => ({ value: f.value, label: f.label ?? f.value, custom: true, group: t("date.companyFields") })),
  ];

  return (
    <FieldStack>
      <RadioGroup
        value={until}
        onValueChange={(v) => onStep({ until: v === "FIELD_FILLED" ? "FIELD_FILLED" : "TASK_DONE" })}
        aria-label={t("wait.until")}
      >
        <label className="flex items-start gap-2.5">
          <RadioGroupItem value="TASK_DONE" disabled={tasks.length === 0} className="mt-0.5" />
          <span className="flex flex-col gap-0.5">
            <span className={tasks.length === 0 ? "text-body text-disabled" : "text-body"}>{t("wait.taskDone")}</span>
            {tasks.length === 0 && <Hint>{t("wait.noTask")}</Hint>}
          </span>
        </label>
        {until === "TASK_DONE" && tasks.length > 0 && (
          <Indented>
            <Field label={t("wait.task")} required error={errorFor(t, problems, "taskStepId")}>
              <CompactPick size="md" options={tasks} value={step.taskStepId ?? null} onChange={(taskStepId) => onStep({ taskStepId })}
                placeholder={t("wait.pickTask")} emptyLabel={t("common.noResults")} ariaLabel={t("wait.task")}
                invalid={Boolean(errorFor(t, problems, "taskStepId"))} />
            </Field>
          </Indented>
        )}
        <label className="flex cursor-pointer items-center gap-2.5">
          <RadioGroupItem value="FIELD_FILLED" />
          <span className="text-body">{t("wait.fieldFilled")}</span>
        </label>
        {until === "FIELD_FILLED" && (
          <Indented>
            <Field label={t("wait.field")} required error={errorFor(t, problems, "field")}>
              <CompactPick size="md" options={fillable} value={step.field ?? null} onChange={(field) => onStep({ until: "FIELD_FILLED", field })}
                placeholder={t("wait.pickField")} emptyLabel={t("common.noFieldsMatch")} ariaLabel={t("wait.field")}
                invalid={Boolean(errorFor(t, problems, "field"))} />
            </Field>
          </Indented>
        )}
      </RadioGroup>

      <Field label={t("wait.atMost")} labelId={ids.wait} error={errorFor(t, problems, "maxDays")}>
        <DaysInput value={step.maxDays} onChange={(maxDays) => onStep({ maxDays })} aria-labelledby={ids.wait}
          invalid={Boolean(errorFor(t, problems, "maxDays"))} />
      </Field>

      <Field label={until === "FIELD_FILLED" ? t("wait.notFilled") : t("wait.notDone")} error={errorFor(t, problems, "onTimeout")}>
        <RadioGroup value={timeout} onValueChange={(v) => onStep({ onTimeout: v as OnTimeout })} aria-label={t("wait.notDone")}>
          {TIMEOUTS.map((v) => (
            <React.Fragment key={v}>
              <label className="flex cursor-pointer items-center gap-2.5">
                <RadioGroupItem value={v} />
                <span className="text-body">{t(`wait.timeout.${v}`)}</span>
              </label>
              {v === "STOP_AND_TELL" && timeout === "STOP_AND_TELL" && (
                <Indented>
                  <Field label={t("wait.tell")} labelId={ids.tell} error={errorFor(t, problems, "tell")}>
                    <PeoplePicker aria-labelledby={ids.tell} value={step.tell ?? []} onChange={(tell) => onStep({ tell })}
                      catalog={catalog} event={event} />
                  </Field>
                </Indented>
              )}
            </React.Fragment>
          ))}
        </RadioGroup>
      </Field>
    </FieldStack>
  );
};
