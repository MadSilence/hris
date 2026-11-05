/**
 * Which words the progress screen shows for the step the company's setup is on (`CompanySetupDTO.stepCode`).
 */
export type SetupStepKey = "starting" | "localization" | "holidays" | "exampleData" | "finishing";

/** The step the setup is on, by its code (`CompanySetupStep`'s name — `stepCode`, I18N_DESIGN.md rule 1). */
const SETUP_STEP_CODES: Record<string, SetupStepKey> = {
  STARTING: "starting",
  LOCALIZATION: "localization",
  HOLIDAYS: "holidays",
  EXAMPLE_DATA: "exampleData",
  FINISHING: "finishing",
};

/**
 * The fallback, for a backend that sends no `stepCode`: its English `step` (`CompanySetupStep.label()`) read as a
 * code. A step known neither way is shown as it came.
 */
const SETUP_STEP_SENTENCES: Record<string, SetupStepKey> = {
  "Getting started": "starting",
  "Setting your time zone and working week": "localization",
  "Building your public holiday calendar": "holidays",
  "Creating your example company": "exampleData",
  "Almost there": "finishing",
};

/** The catalogue key of the step, or null when only the server's words can say it. */
export const setupStepKey = (step: string | null, stepCode: string | null | undefined): SetupStepKey | null => {
  if (stepCode && SETUP_STEP_CODES[stepCode]) return SETUP_STEP_CODES[stepCode];
  if (!step) return "starting";
  return SETUP_STEP_SENTENCES[step] ?? null;
};
