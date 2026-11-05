/**
 * The steps of a review that are not writing one (REVIEWS_PLAN.md 10.2–10.3): nominating peers, approving them,
 * approving a manager review. Where each one's page is, and the check a nomination passes before it is sent.
 */
import type { Nomination, ReviewStepKind } from "./index";
import type { ReviewsT } from "./i18n";

/** Where a step's page is: its Tasks row and My Reviews both lead there. */
export function stepHref(kind: ReviewStepKind, participantId: string): string {
  switch (kind) {
    case "NOMINATE_PEERS":
      return `/reviews/nominations/${participantId}`;
    case "APPROVE_PEERS":
      return `/reviews/nominations/${participantId}`;
    case "APPROVE_REVIEW":
      return `/reviews/packets/${participantId}`;
  }
}

export const REVIEW_STEP_KEYS = {
  NOMINATE_PEERS: "steps.nominatePeers",
  APPROVE_PEERS: "steps.approvePeers",
  APPROVE_REVIEW: "steps.approveReview",
} as const satisfies Record<ReviewStepKind, string>;

/**
 * Whether a nomination of these peers can be sent: within the least and the most, never the person or their manager.
 * Returns the reason it cannot, or null. The server checks the same.
 */
export function nominationProblem(
  picked: string[],
  nomination: Pick<Nomination, "peerMin" | "peerMax" | "excluded">,
  t: ReviewsT,
): string | null {
  const unique = Array.from(new Set(picked));
  if (unique.some((id) => nomination.excluded.includes(id))) return t("nomination.problem.excluded");
  if (unique.length < nomination.peerMin || unique.length > nomination.peerMax) {
    return nomination.peerMin === nomination.peerMax
      ? t("nomination.problem.exactly", { count: nomination.peerMin })
      : t("nomination.problem.between", { min: nomination.peerMin, max: nomination.peerMax });
  }
  return null;
}
