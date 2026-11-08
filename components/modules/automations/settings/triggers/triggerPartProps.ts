import type { AutomationCatalog, AutomationDefinition, AutomationProblem, TriggerSpec } from "@/models/automations";

/** What each trigger's settings get from `TriggerFields`. */
export type TriggerPartProps = {
  definition: AutomationDefinition;
  trigger: TriggerSpec;
  catalog: AutomationCatalog;
  problems: AutomationProblem[];
  /** Changes some of the trigger's own settings. */
  onTrigger: (patch: Partial<TriggerSpec>) => void;
  /** Changes the definition — the late policy lives there, not on the trigger. */
  onDefinition: (definition: AutomationDefinition) => void;
};
