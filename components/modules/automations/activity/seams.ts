/**
 * What Activity takes from the other parts of the automations screens (`../contracts.ts`), in one place: the condition
 * builder is the settings part's, a run's status and its window are the runs part's. A test of this folder mocks this
 * file instead of reaching into another part's folder.
 */
export { ConditionBuilder } from "@/components/modules/automations/settings";
export { RunStatusBadge, RunWindow } from "@/components/modules/automations/runs";
