import type {
  AssignmentApplyDTO,
  AssignmentSkipReason,
  AssignmentSkippedUser,
} from "@/api/modules/assignments/dto/AssignmentDTO";

/**
 * Why the assignment engine passed someone over, in words.
 *
 * The engine has always reported this — `skipped[]` comes back with a reason per person — and the
 * screens have always thrown it away. The result was a confirmation dialog that closed on "success"
 * while nothing had happened: drag an archived colleague onto a team, confirm, watch the chip stay
 * exactly where it was.
 */
export function skipReasonText(reason: AssignmentSkipReason): string {
  switch (reason) {
    case "DUPLICATE":
      return "already there";
    case "USER_ARCHIVED":
      return "archived";
    case "USER_NOT_FOUND":
      return "no longer exists";
    case "INVALID_TARGET":
      return "cannot be assigned here";
    case "DOMAIN_ERROR":
    default:
      return "rejected by the system";
  }
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
export function describeSkips(skipped: AssignmentSkippedUser[]): string | null {
  if (!skipped || skipped.length === 0) return null;

  if (skipped.length === 1) {
    const [user] = skipped;
    return `${personName(user)} was not added — ${skipReasonText(user.reason)}.`;
  }

  const byReason = new Map<AssignmentSkipReason, number>();
  for (const user of skipped) {
    byReason.set(user.reason, (byReason.get(user.reason) ?? 0) + 1);
  }

  const parts = [...byReason.entries()].map(([reason, count]) => `${count} ${skipReasonText(reason)}`);
  return `${skipped.length} people were not added: ${parts.join(", ")}.`;
}

/**
 * The message to raise when an apply that was meant to move one person did nothing.
 *
 * Only a completely empty result counts as a failure: a bulk apply that added nine of ten people did
 * work, and the note about the tenth belongs next to the result, not in place of it.
 */
export function assignmentSkippedEverything(result: AssignmentApplyDTO | undefined): string | null {
  if (!result) return null;
  if (result.created.length > 0) return null;

  return describeSkips(result.skipped);
}
