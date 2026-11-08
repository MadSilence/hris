"use client";

import * as React from "react";
import type { TriggerSpec } from "@/models/automations";
import type { TriggerFieldsProps } from "../../contracts";
import { TriggerReadRows } from "../read/TriggerReadRows";
import { DateTriggerFields } from "./DateTriggerFields";
import { FieldChangeFields } from "./FieldChangeFields";
import { ProcessFields, TimeOffFields } from "./EventTriggerFields";
import { ScheduleFields } from "./ScheduleFields";
import { JoinsGroupFields, NoSettingsLine } from "./OtherTriggerFields";
import type { TriggerPartProps } from "./triggerPartProps";

/**
 * One trigger's settings (T1–T6) inside the step settings window, under "What starts it". Read mode (R3) shows icon
 * rows instead of fields. Nothing here when there is no trigger yet — the editor shows the trigger list then.
 */
export const TriggerFields: React.FC<TriggerFieldsProps> = ({ definition, catalog, readOnly, problems, onChange }) => {
  const trigger = definition.trigger;
  if (!trigger) return null;
  if (readOnly) return <TriggerReadRows definition={definition} catalog={catalog} />;

  const props: TriggerPartProps = {
    definition,
    trigger,
    catalog,
    problems,
    onTrigger: (patch: Partial<TriggerSpec>) => onChange({ ...definition, trigger: { ...trigger, ...patch } }),
    onDefinition: onChange,
  };

  switch (trigger.type) {
    case "DATE_OFFSET":
      return <DateTriggerFields {...props} />;
    case "FIELD_CHANGED":
      return <FieldChangeFields {...props} />;
    case "SCHEDULE":
      return <ScheduleFields {...props} />;
    case "JOINS_SEGMENT":
      return <JoinsGroupFields {...props} />;
    case "EVENT":
      return trigger.event === "PROCESS_COMPLETED" ? <ProcessFields {...props} /> : <TimeOffFields {...props} />;
    default:
      return <NoSettingsLine type={trigger.type} />;
  }
};
