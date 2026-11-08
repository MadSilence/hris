import type { useTranslations } from "next-intl";
import type { AutomationProblem, AutomationStepType } from "@/models/automations";

export type SettingsTranslator = ReturnType<typeof useTranslations<"automationsSettings">>;

/** The backend's error codes the windows word differently (hris-api `AutomationBusinessError`). */
const UNKNOWN_PLACEHOLDER = "AU00005";
const TARGET_GONE = "AU00006";
const UNSUPPORTED_TARGET = "AU00015";

/** The first problem about one field: a step's own (`title`), or the trigger's (`trigger.days`). */
export const problemAt = (problems: AutomationProblem[], field: string): AutomationProblem | null =>
  problems.find((p) => p.field === field) ?? null;

const STEP_FIELDS = [
  "recipients",
  "text",
  "subject",
  "body",
  "title",
  "description",
  "dueDays",
  "assignableId",
  "assignableType",
  "policyId",
  "formId",
  "until",
  "field",
  "taskStepId",
  "maxDays",
  "onTimeout",
  "tell",
  "question",
  "paths",
  "documents",
  "survey",
  "when",
  "action",
] as const;
type StepField = (typeof STEP_FIELDS)[number];

const TRIGGER_FIELDS = [
  "field",
  "attributeId",
  "date",
  "everyYear",
  "days",
  "from",
  "to",
  "event",
  "eventConditions",
  "anchor",
  "process",
  "frequency",
  "at",
  "timeZone",
  "weekdays",
  "weekOfMonth",
  "monthOfPeriod",
  "dayOfMonth",
] as const;
type TriggerField = (typeof TRIGGER_FIELDS)[number];

const isStepField = (f: string): f is StepField => (STEP_FIELDS as readonly string[]).includes(f);
const isTriggerField = (f: string): f is TriggerField => (TRIGGER_FIELDS as readonly string[]).includes(f);

/**
 * The sentence under a field for a problem the check found. The backend's own `message` is technical English and is
 * not shown (`hris/CLAUDE.md` § "Showing a failure"); the sentence comes from this part's catalogue by the field, and
 * for "who" by the step's type. An unknown placeholder names the placeholders the backend listed — data, not words.
 */
export const problemText = (
  t: SettingsTranslator,
  problem: AutomationProblem | null,
  stepType?: AutomationStepType | null,
): string | null => {
  if (!problem) return null;
  if (problem.code === TARGET_GONE) return t("problems.removed");
  if (problem.code === UNKNOWN_PLACEHOLDER) return t("problems.unknownField", { fields: problem.message });
  if (problem.code === UNSUPPORTED_TARGET) return t("problems.unsupported");
  const field = problem.field ?? "";
  if (field.startsWith("trigger.")) {
    const f = field.slice("trigger.".length);
    return isTriggerField(f) ? t(`problems.trigger.${f}`) : t("problems.generic");
  }
  if (field === "assignee") {
    switch (stepType) {
      case "REQUEST_APPROVAL":
        return t("problems.assignee.approval");
      case "START_REVIEW":
        return t("problems.assignee.review");
      case "SIGN_DOCUMENT":
        return t("problems.assignee.sign");
      default:
        return t("problems.assignee.task");
    }
  }
  return isStepField(field) ? t(`problems.step.${field}`) : t("problems.generic");
};

/** `problemText(problemAt(…))` in one call, for a field. */
export const errorFor = (
  t: SettingsTranslator,
  problems: AutomationProblem[],
  field: string,
  stepType?: AutomationStepType | null,
): string | null => problemText(t, problemAt(problems, field), stepType);
