import type { AssignmentRow } from "@/models/reviews";

/**
 * The reviews a person's row on the run page lists. A cancelled review stays only when somebody was really asked and
 * the request ended on its own — a reviewer who left reads "Withdrawn". A review the runner withdrew, and a nominee
 * the approver struck off before anybody was asked (walk of 2026-11-03), are not shown at all.
 */
export function shownReviews(reviews: AssignmentRow[]): AssignmentRow[] {
  return reviews.filter((a) => a.status !== "CANCELLED" || (a.reason !== "WITHDRAWN" && a.reason !== "NOT_APPROVED"));
}
