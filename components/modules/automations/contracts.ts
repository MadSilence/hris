/**
 * The seams between the parts of the automations screens (the redesign, `design/screens/automations-*`). Each part is
 * owned by one folder; a part uses another only through what is declared here.
 *
 *   model/     the step tree, pure (tree.ts) — shared
 *   shared/    the status badge, the automation icon, the noddo AI prompt field — the list's part
 *   list/      the list page, its cards and dialogs, New automation, the Activity tab
 *   editor/    the editor: header, sentence, canvas, tool block and windows, step settings window frame, Who sees what,
 *              the editor's dialogs and banners, the noddo AI window
 *   settings/  what goes inside the windows: the trigger list and settings, every step's fields, the common When and
 *              Only if, the condition builder, the people picker with roles, the token text field, read rows, and the
 *              words that describe a trigger or a step (cards, the sentence, the list's "Starts when")
 *   runs/      run history, one run's window, Versions, the test run, a person's runs on the profile
 *
 * Words: the shared vocabulary is the `automations` catalogue (statuses, step and trigger names, recipients, reasons);
 * each part has its own catalogue — `automationsList`, `automationsEditor`, `automationsSettings`, `automationsRuns`.
 */
import type {
  Automation,
  AutomationCatalog,
  AutomationCheck,
  AutomationDefinition,
  AutomationProblem,
  AutomationRun,
  AutomationStatus,
  AutomationVersion,
  StepSpec,
  TriggerSpec,
} from "@/models/automations";
import type { Segment } from "@/models/segment/Segment";

// ── settings/ → editor/ ────────────────────────────────────────────────────────────────────────

/** The trigger list (F2, "What starts it" tool window). Picking one sets the trigger with its defaults. */
export type TriggerListProps = {
  catalog: AutomationCatalog;
  current: TriggerSpec | null;
  onPick: (trigger: TriggerSpec) => void;
};

/**
 * One trigger's settings (T1–T6), inside the step settings window under "What starts it". It edits the whole definition
 * because "Someone joins a group" reads Who it runs for, and changing the trigger can make steps need details.
 */
export type TriggerFieldsProps = {
  definition: AutomationDefinition;
  catalog: AutomationCatalog;
  readOnly: boolean;
  problems: AutomationProblem[];
  onChange: (definition: AutomationDefinition) => void;
};

/**
 * One step's settings (S1–S7, G4, D3, H4): its own fields, a divider, then the common When and Only if. A split's
 * paths and an approval's no-answer settings are fields of the step. Read mode (R3) shows icon rows instead.
 */
export type StepFieldsProps = {
  definition: AutomationDefinition;
  step: StepSpec;
  catalog: AutomationCatalog;
  readOnly: boolean;
  /** The problems of this step only (F3: the field shows `FieldError`). */
  problems: AutomationProblem[];
  onChange: (step: StepSpec) => void;
};

/** "Who it runs for" (G3, G3b, R4): Everyone / Only some people and the condition builder, with the count. */
export type WhoItRunsForProps = {
  conditions: Segment;
  readOnly: boolean;
  /** The last check's count and people, for "48 people match · See who"; null while it loads. */
  check: AutomationCheck | null;
  onChange: (conditions: Segment) => void;
};

/** The one condition builder (Who it runs for, a trigger's "Only when", a step's "Only if", a path, Activity's Filters). */
export type ConditionBuilderProps = {
  value: Segment | null;
  readOnly?: boolean;
  onChange: (value: Segment | null) => void;
  /** "48 people match · See who" under the group, when the caller has a count. */
  count?: { matching: number; people: { id: string | null; name: string | null }[] } | null;
};

/**
 * The words of an automation, for cards, the sentence and lists — exported by `settings/` as the hook
 * `useAutomationWords()`: `triggerTitle(trigger)` ("Time off over 10 days is requested"), `triggerLine(trigger)` (the
 * list's "Starts when": "7 days before start date"), `stepKind(step)` ("Ask for approval"), `stepTitle(step)`
 * ("Their manager approves"), `stepSubtitle(step)` ("No answer in 3 days: ask their manager"), `sentence(definition)`
 * (the parts of "In short", each marked with the step it belongs to).
 */
export type SentencePart = { text: string; stepId: string | null; chip: boolean; placeholder: boolean };

// ── runs/ → editor/ ────────────────────────────────────────────────────────────────────────────

/** The Run history tool window (V1–V4b): the list; opening a row opens the run window on the right. */
export type RunHistoryWindowProps = {
  automationId: string;
  selectedRunId: string | null;
  onOpenRun: (runId: string) => void;
  onClose: () => void;
};

/** One run's window, on the right (V1, V1b, G2). The editor draws the run's state on the canvas from `onRun`. */
export type RunWindowProps = {
  runId: string;
  definition: AutomationDefinition | null;
  canManage: boolean;
  onRun?: (run: AutomationRun | null) => void;
  onClose: () => void;
};

/** The Versions tool window (V5). Viewing one shows it read only on the canvas, with its banner. */
export type VersionsWindowProps = {
  automationId: string | null;
  onView: (version: AutomationVersion | null) => void;
  onClose: () => void;
};

/** The test run (G1a, G1, G1b) as a tool window, and as a dialog when expanded (G1m). */
export type TestRunWindowProps = {
  automationId: string | null;
  name: string;
  definition: AutomationDefinition;
  expanded: boolean;
  onExpand: (expanded: boolean) => void;
  onClose: () => void;
};

// ── shared/ ────────────────────────────────────────────────────────────────────────────────────

export type AutomationStatusBadgeProps = { status: AutomationStatus };

/** The automation's icon: a code of `AUTOMATION_ICONS`; null falls back to the trigger's own. */
export type AutomationIconProps = { icon: string | null; trigger?: TriggerSpec | null; size?: 16 | 20 };

/** The noddo AI prompt (E2, Main, D1): a textarea with a hint and "Draft with AI" inside its lower edge. */
export type AiPromptFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  busy?: boolean;
  error?: string | null;
  variant?: "page" | "dialog" | "window";
};

// ── editor/ ────────────────────────────────────────────────────────────────────────────────────

/** The editor page: an automation by id, or a new one from a template, a prompt for noddo AI, or nothing. */
export type AutomationEditorProps = {
  automationId?: string | null;
  templateKey?: string | null;
  aiPrompt?: string | null;
  /** "Fix the step" and "See why": open with this step's settings, or this run's window. */
  focusStepId?: string | null;
  focusRunId?: string | null;
};

export type { Automation };
