import type { Overview } from "@/models/hub";

/**
 * The *Must-read pages open* tile's hint (CM01; WALK_QUESTIONS § 44): "No must-read pages" only when there are none at
 * all — with none open but some past the deadline it counts those, as its neighbour *Missed the deadline* does.
 */
export const mustReadHint = (
  o: Pick<Overview, "openMustRead" | "openAgreed" | "openNeeded" | "missedPages">,
):
  | { key: "agreedOf"; values: { agreed: number; needed: number } }
  | { key: "pastDeadline"; values: { count: number } }
  | { key: "noMustRead"; values?: undefined } =>
  o.openMustRead > 0
    ? { key: "agreedOf", values: { agreed: o.openAgreed, needed: o.openNeeded } }
    : o.missedPages > 0
      ? { key: "pastDeadline", values: { count: o.missedPages } }
      : { key: "noMustRead" };
