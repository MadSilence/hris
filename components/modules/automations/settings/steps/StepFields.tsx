"use client";

import * as React from "react";
import type { AutomationCatalog, AutomationDefinition, AutomationEventOption, StepSpec } from "@/models/automations";
import type { StepFieldsProps } from "../../contracts";
import { StepReadRows } from "../read/StepReadRows";
import { FieldStack, PartDivider } from "../parts/parts";
import { CommonFields } from "./CommonFields";
import { ApprovalFields, EmailFields, NotifyFields, ReviewFields, SignFields, SurveyFields, TaskFields } from "./PeopleSteps";
import { AssignFields, PolicyFields } from "./RecordSteps";
import { SplitFields } from "./SplitFields";
import { WaitFields } from "./WaitFields";
import type { StepPartProps } from "./stepPartProps";

/** The trigger's event, when it is one — it adds placeholders and "The approver". */
export const eventOf = (definition: AutomationDefinition, catalog: AutomationCatalog): AutomationEventOption | null => {
  const trigger = definition.trigger;
  if (trigger?.type !== "EVENT" || !trigger.event) return null;
  return catalog.events.find((e) => e.value === trigger.event) ?? null;
};

/** The fields a text may insert: the catalogue's and the trigger event's, once each. */
export const placeholdersOf = (definition: AutomationDefinition, catalog: AutomationCatalog): string[] => [
  ...new Set([...(catalog.placeholders ?? []), ...(eventOf(definition, catalog)?.placeholders ?? [])]),
];

const OwnFields: React.FC<StepPartProps> = (props) => {
  switch (props.step.type) {
    case "NOTIFY":
      return <NotifyFields {...props} />;
    case "SEND_EMAIL":
      return <EmailFields {...props} />;
    case "CREATE_TASK":
      return <TaskFields {...props} />;
    case "REQUEST_APPROVAL":
      return <ApprovalFields {...props} />;
    case "START_REVIEW":
      return <ReviewFields {...props} />;
    case "WAIT_UNTIL":
      return <WaitFields {...props} />;
    case "ASSIGN":
    case "UNASSIGN":
      return <AssignFields {...props} />;
    case "GRANT_TIME_OFF_POLICY":
      return <PolicyFields {...props} />;
    case "SPLIT":
      return <SplitFields {...props} />;
    case "SIGN_DOCUMENT":
      return <SignFields {...props} />;
    case "SEND_SURVEY":
      return <SurveyFields {...props} />;
    default:
      return null;
  }
};

/**
 * One step's settings (S1–S7, G4, D3, H4): the step's own fields, a divider, then the common When and Only if. Read
 * mode (R3) is icon rows. Each step gets fresh field state (a key), so switching steps never carries a half-typed
 * value across.
 */
export const StepFields: React.FC<StepFieldsProps> = ({ definition, step, catalog, readOnly, problems, onChange }) => {
  if (readOnly) return <StepReadRows definition={definition} step={step} catalog={catalog} />;
  const props: StepPartProps = {
    definition,
    step,
    catalog,
    problems,
    onStep: (patch: Partial<StepSpec>) => onChange({ ...step, ...patch }),
    event: eventOf(definition, catalog),
    placeholders: placeholdersOf(definition, catalog),
  };
  return (
    <FieldStack key={step.id}>
      <OwnFields {...props} />
      <PartDivider />
      <CommonFields step={step} catalog={catalog} problems={problems} onStep={props.onStep} />
    </FieldStack>
  );
};
