/**
 * The steps of a review that are not writing one (REVIEWS_PLAN.md 10.2–10.3): nominating peers, approving them,
 * approving a manager review. Where each one's page is, and the check a nomination passes before it is sent.
 */
import type { Nomination, ReviewStepKind } from "./index";

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

export const REVIEW_STEP_LABELS: Record<ReviewStepKind, string> = {
  NOMINATE_PEERS: "Nominate Peers",
  APPROVE_PEERS: "Approve Peers",
  APPROVE_REVIEW: "Approve Review",
};

/**
 * Whether a nomination of these peers can be sent: within the least and the most, never the person or their manager.
 * Returns the reason it cannot, or null. The server checks the same.
 */
export function nominationProblem(picked: string[], nomination: Pick<Nomination, "peerMin" | "peerMax" | "excluded">): string | null {
  const unique = Array.from(new Set(picked));
  if (unique.some((id) => nomination.excluded.includes(id))) return "Neither the person nor their manager can be chosen.";
  if (unique.length < nomination.peerMin || unique.length > nomination.peerMax) {
    return nomination.peerMin === nomination.peerMax
      ? `Choose ${nomination.peerMin} ${nomination.peerMin === 1 ? "peer" : "peers"}.`
      : `Choose between ${nomination.peerMin} and ${nomination.peerMax} peers.`;
  }
  return null;
}
