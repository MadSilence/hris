/**
 * What the editor takes from the other parts of the automations screens (`../contracts.ts`), in one place: what goes
 * inside the windows is the settings part's, the run and version windows are the runs part's. A test of this folder
 * mocks this file instead of reaching into another part's folder.
 */
export { TriggerList, TriggerFields, StepFields, WhoItRunsFor, useAutomationWords, choiceOf, usePlaceholderLabel } from "@/components/modules/automations/settings";
export { RunHistoryWindow, RunWindow, VersionsWindow, TestRunWindow } from "@/components/modules/automations/runs";
