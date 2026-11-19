"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { Field, FieldStack, GreyLine, Hint, MistNote, WindowSection } from "../parts/parts";
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
 * Someone joins a group (T5, the designers' fixes C27): the group is Who it runs for — said in a Mist note, then shown
 * as a button that opens the Who it runs for window, where it is changed; then the section "When someone stops
 * matching".
 */
export const JoinsGroupFields: React.FC<TriggerPartProps> = ({ definition, trigger, onTrigger, onOpenWho }) => {
  const t = useTranslations("automationsSettings");
  const whoId = React.useId();
  return (
    <FieldStack>
      <MistNote>
        {t.rich("joins.line", {
          b: (chunks) => <span className="font-semibold">{chunks}</span>,
          who: () => <WhoLine definition={definition} />,
        })}
      </MistNote>
      <Field label={t("who.title")} labelId={whoId} hint={t("joins.change")}>
        <Button type="button" variant="secondary" size="sm" className="w-fit max-w-full" onClick={() => onOpenWho?.()}>
          <Icon icon={UserGroupIcon} size="sm" />
          <span className="truncate">
            <WhoLine definition={definition} />
          </span>
        </Button>
      </Field>
      <WindowSection title={t("joins.stops")}>
        <RadioGroup
          value={trigger.onLeave ?? "TAKE_BACK"}
          onValueChange={(v) => onTrigger({ onLeave: v === "KEEP" ? "KEEP" : "TAKE_BACK" })}
          aria-label={t("joins.stops")}
          className="gap-2.5"
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
      </WindowSection>
    </FieldStack>
  );
};

/** Someone is hired, a termination is scheduled, a last working day comes: nothing to set — one grey line. */
export const NoSettingsLine: React.FC<{ type: "PERSON_HIRED" | "TERMINATION_SCHEDULED" | "LAST_WORKING_DAY_ARRIVES" }> = ({ type }) => {
  const t = useTranslations("automationsSettings");
  return <GreyLine>{t(`noSettings.${type}`)}</GreyLine>;
};
