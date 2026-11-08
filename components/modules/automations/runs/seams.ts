/**
 * What this part takes from the other parts of the automations screens (`../contracts.ts`), in one place: the words
 * of a trigger and a step are the settings part's, the segmented control is the shared kit's. A test of this folder
 * mocks this file instead of reaching into another part's folder.
 */
export { useAutomationWords } from "@/components/modules/automations/settings";
export { SegmentedControl } from "@/components/ui/SegmentedControl";
