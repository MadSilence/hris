import type { AssignmentRow } from "@/models/reviews";
import { partialMock } from "@/test/types";
import { shownReviews } from "./runRows";

const row = (id: string, status: AssignmentRow["status"], reason: string | null = null) =>
  partialMock<AssignmentRow>({ id, status, reason });

describe("shownReviews", () => {
  it("leaves out a withdrawn review and a nominee who was never approved", () => {
    const rows = [
      row("open", "OPEN"),
      row("withdrawn", "CANCELLED", "WITHDRAWN"),
      row("struck", "CANCELLED", "NOT_APPROVED"),
      row("left", "CANCELLED", "REVIEWER_LEFT"),
    ];
    expect(shownReviews(rows).map((r) => r.id)).toEqual(["open", "left"]);
  });
});
