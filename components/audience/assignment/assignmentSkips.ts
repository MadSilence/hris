import type {
  AssignmentApplyDTO,
  AssignmentSkipReason,
  AssignmentSkippedUser,
} from "@/api/modules/assignments/dto/AssignmentDTO";
import type { AccessTranslator } from "@/components/audience/accessTranslator";

const REASON_KEY = {
  DUPLICATE: "duplicate",
  USER_ARCHIVED: "userArchived",
  USER_NOT_FOUND: "userNotFound",
  INVALID_TARGET: "invalidTarget",
  HAND_OVERRIDE: "handOverride",
  RULE_CONFLICT: "ruleConflict",
  DOMAIN_ERROR: "domainError",
} as const satisfies Record<AssignmentSkipReason, string>;

/**
 * Why the assignment engine passed someone over, in words.
 *
 * The engine has always reported this — `skipped[]` comes back with a reason per person — and the
 * screens have always thrown it away. The result was a confirmation dialog that closed on "success"
 * while nothing had happened: drag an archived colleague onto a team, confirm, watch the chip stay
 * exactly where it was.
 */
export function skipReasonText(reason: AssignmentSkipReason, t: AccessTranslator): string {
  return t(`audience.skips.reasons.${REASON_KEY[reason] ?? "domainError"}`);
}

function personName(user: AssignmentSkippedUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email;
}

/**
 * A sentence for what the apply skipped, or null when it skipped nothing.
 *
 * One person gets named — that is the drag-and-drop case, where the answer to "why did nothing
 * happen" has to be specific. Several get counted per reason, because a bulk assign that lists
 * thirty names is not a message anyone reads.
 */
export function describeSkips(
  skipped: AssignmentSkippedUser[],
  t: AccessTranslator,
): string | null {
  if (!skipped || skipped.length === 0) return null;

  if (skipped.length === 1) {
    const [user] = skipped;
    return t("audience.skips.one", { name: personName(user), reason: skipReasonText(user.reason, t) });
  }

  const byReason = new Map<AssignmentSkipReason, number>();
  for (const user of skipped) {
    byReason.set(user.reason, (byReason.get(user.reason) ?? 0) + 1);
  }

  const parts = [...byReason.entries()].map(([reason, count]) =>
    t("audience.skips.countLine", { count, reason: skipReasonText(reason, t) }),
  );
  return t("audience.skips.several", { count: skipped.length, parts: parts.join(", ") });
}

/**
 * The message to raise when an apply that was meant to move one person did nothing.
 *
 * Only a completely empty result counts as a failure: a bulk apply that added nine of ten people did
 * work, and the note about the tenth belongs next to the result, not in place of it.
 */
export function assignmentSkippedEverything(
  result: AssignmentApplyDTO | undefined,
  t: AccessTranslator,
): string | null {
  if (!result) return null;
  if (result.created.length > 0) return null;

  return describeSkips(result.skipped, t);
}

/**
 * Skips counted by reason — what a preview returns as `skippedByReason` — as lines in a fixed order,
 * largest first, so "N will be assigned, M skipped" can say why without listing anybody.
 */
export function skipCountLines(
  counts: Partial<Record<AssignmentSkipReason, number>> | null | undefined,
  t: AccessTranslator,
): { reason: AssignmentSkipReason; count: number; text: string }[] {
  return Object.entries(counts ?? {})
    .map(([reason, count]) => ({ reason: reason as AssignmentSkipReason, count: count ?? 0 }))
    .filter((line) => line.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((line) => ({
      ...line,
      text: t("audience.skips.countLine", { count: line.count, reason: skipReasonText(line.reason, t) }),
    }));
}

/** The same counts, built from a per-person list when the response carries no tally of its own. */
export function countSkips(skipped: AssignmentSkippedUser[] | null | undefined): Partial<Record<AssignmentSkipReason, number>> {
  const out: Partial<Record<AssignmentSkipReason, number>> = {};
  for (const user of skipped ?? []) out[user.reason] = (out[user.reason] ?? 0) + 1;
  return out;
}
