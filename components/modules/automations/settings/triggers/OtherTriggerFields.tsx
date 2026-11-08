"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { Field, FieldStack, GreyLine, Hint, PartDivider } from "../parts/parts";
import { ConditionLine } from "../conditions/ConditionSummary";
import { useConditionFields } from "../conditions/ConditionBuilder";
import type { TriggerPartProps } from "./triggerPartProps";

/** Who it runs for in one line: "Department is Engineering and Office is Vilnius", or everyone. */
export const WhoLine: React.FC<{ definition: TriggerPartProps["definition"] }> = ({ definition }) => {
  const t = useTranslations("automationsSettings");
  const { catalog, dtos } = useConditionFields();
  const filters = definition.conditions?.filters ?? [];
  if (filters.length === 0) return <>{t("who.everyone")}</>;
  return (
    <>
      {filters.map((f, i) => (
        <React.Fragment key={`${f.field}-${i}`}>
          {i > 0 && ` ${t("conditions.andLower")} `}
          <ConditionLine filter={f} catalog={catalog} dtos={dtos} />
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Someone joins a group (T5): the group is Who it runs for, so it is named in grey and changed there; then what
 * happens when somebody stops matching.
 */
export const JoinsGroupFields: React.FC<TriggerPartProps> = ({ definition, trigger, onTrigger }) => {
  const t = useTranslations("automationsSettings");
  return (
    <FieldStack>
      <div className="flex flex-col gap-1">
        <GreyLine>
          {t.rich("joins.line", {
            who: () => (
              <span className="font-medium text-primary">
                <WhoLine definition={definition} />
              </span>
            ),
          })}
        </GreyLine>
        <Hint>{t("joins.change")}</Hint>
      </div>
      <PartDivider />
      <Field label={t("joins.stops")}>
        <RadioGroup
          value={trigger.onLeave ?? "TAKE_BACK"}
          onValueChange={(v) => onTrigger({ onLeave: v === "KEEP" ? "KEEP" : "TAKE_BACK" })}
          aria-label={t("joins.stops")}
        >
          <label className="flex cursor-pointer items-start gap-2.5">
            <RadioGroupItem value="TAKE_BACK" className="mt-0.5" />
            <span className="flex flex-col gap-0.5">
              <span className="text-body">{t("joins.takeBack")}</span>
              <Hint>{t("joins.takeBackHint")}</Hint>
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <RadioGroupItem value="KEEP" />
            <span className="text-body">{t("joins.keep")}</span>
          </label>
        </RadioGroup>
      </Field>
    </FieldStack>
  );
};

/** Someone is hired, a termination is scheduled, a last working day comes: nothing to set — one grey line. */
export const NoSettingsLine: React.FC<{ type: "PERSON_HIRED" | "TERMINATION_SCHEDULED" | "LAST_WORKING_DAY_ARRIVES" }> = ({ type }) => {
  const t = useTranslations("automationsSettings");
  return <GreyLine>{t(`noSettings.${type}`)}</GreyLine>;
};
