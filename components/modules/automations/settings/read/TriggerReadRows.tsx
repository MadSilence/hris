"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Clock01Icon, Globe02Icon, Calendar03Icon, UserGroupIcon, FilterIcon } from "@hugeicons/core-free-icons";
import type { AutomationCatalog, AutomationDefinition } from "@/models/automations";
import { TRIGGER_CHOICES, choiceOf } from "../triggers/triggerChoices";
import { useAutomationWords } from "../words/useAutomationWords";
import { ReadRows, type ReadRow } from "./ReadRows";

/** The trigger in read mode (R3): what starts it and its key settings, as icon rows. */
export const TriggerReadRows: React.FC<{ definition: AutomationDefinition; catalog: AutomationCatalog }> = ({ definition, catalog }) => {
  const t = useTranslations("automationsSettings");
  const words = useAutomationWords();
  const trigger = definition.trigger;
  if (!trigger) return null;
  const choice = TRIGGER_CHOICES.find((c) => c.key === choiceOf(trigger));
  const rows: ReadRow[] = [
    { icon: choice?.icon ?? Calendar03Icon, value: words.triggerTitle(trigger, definition.conditions), caption: words.triggerSubtitle(trigger) },
  ];

  switch (trigger.type) {
    case "DATE_OFFSET":
      if (trigger.field !== "FIXED") {
        rows.push({
          icon: Clock01Icon,
          value:
            definition.latePolicy === "SKIP"
              ? t("date.skip")
              : t("read.runLate", { days: definition.lateWindowDays ?? catalog.defaultLateWindowDays }),
          caption: t("date.passed"),
        });
      }
      break;
    case "FIELD_CHANGED":
      rows.push({ icon: Clock01Icon, value: t(`fieldChange.when.${trigger.when === "RECORDED" ? "RECORDED" : "EFFECTIVE"}`), caption: t("fieldChange.later") });
      break;
    case "SCHEDULE": {
      const zone = trigger.timeZone ?? "PERSON";
      rows.push({
        icon: Globe02Icon,
        value: zone === "PERSON" || zone === "COMPANY" ? t(`schedule.zone.${zone}`) : zone.replace(/_/g, " "),
        caption: t("schedule.timeZone"),
      });
      break;
    }
    case "JOINS_SEGMENT":
      rows.push({ icon: UserGroupIcon, value: t(trigger.onLeave === "KEEP" ? "joins.keep" : "joins.takeBack"), caption: t("joins.stops") });
      break;
    case "EVENT":
      if (trigger.event !== "PROCESS_COMPLETED") {
        rows.push({ icon: Calendar03Icon, value: t(`event.anchor.${trigger.anchor ?? "EVENT"}`), caption: t("event.countFrom") });
      }
      if (!trigger.eventConditions) rows.push({ icon: FilterIcon, value: t("read.always"), caption: t("read.noConditions") });
      break;
    default:
      break;
  }
  return <ReadRows rows={rows} />;
};
