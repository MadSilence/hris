import type {
  AutomationCatalog,
  AutomationDefinition,
  AutomationEventOption,
  AutomationProblem,
  StepSpec,
} from "@/models/automations";

/** What each step type's fields get from `StepFields`. */
export type StepPartProps = {
  definition: AutomationDefinition;
  step: StepSpec;
  catalog: AutomationCatalog;
  problems: AutomationProblem[];
  onStep: (patch: Partial<StepSpec>) => void;
  /** The trigger's event, when it is one — it adds placeholders and "The approver". */
  event: AutomationEventOption | null;
  /** Every field a text may insert: the catalogue's and the event's. */
  placeholders: string[];
};
