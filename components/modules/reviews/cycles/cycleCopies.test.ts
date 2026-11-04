import type { Cycle } from "@/models/reviews";
import { shiftIsoDate, shiftedCycleDates, validRepeatMonths } from "./cycleCopies";

const cycle = (patch: Partial<Cycle> = {}): Cycle => ({
  id: "c1",
  name: "H1 2026 review",
  description: null,
  status: "CLOSED",
  segment: { filters: [], excludeUserIds: [] },
  eligibleHiredBefore: "2026-01-31",
  scale: [],
  sharingMode: "RELEASED_ON_DATE",
  releaseDate: "2026-03-15",
  ownerUserId: null,
  ownerName: null,
  kinds: [
    { kind: "SELF", formId: "f1", formName: "Self", formArchived: false, questionCount: 2, opensOn: "2026-01-31",
      dueOn: "2026-02-14", anonymous: false, anonymityThreshold: null, peerMin: null, peerMax: null, reviewerCap: null,
      peerMode: null, nominationDueOn: null, approvalDueOn: null },
    { kind: "PEER", formId: "f2", formName: "Peer", formArchived: false, questionCount: 2, opensOn: null,
      dueOn: "2026-02-28", anonymous: true, anonymityThreshold: 3, peerMin: 2, peerMax: 4, reviewerCap: 6,
      peerMode: "SUBJECT_NOMINATES", nominationDueOn: "2026-02-05", approvalDueOn: "2026-02-10" },
  ],
  launchedAt: null,
  releasedAt: null,
  closedAt: null,
  createdAt: "2026-01-01T10:00:00",
  version: 1,
  approvalMode: "NONE",
  approverUserId: null,
  approverName: null,
  template: false,
  ...patch,
});

describe("repeating a cycle", () => {
  it("moves a date by whole months, to the last day of a shorter month", () => {
    expect(shiftIsoDate("2026-01-31", 1)).toBe("2026-02-28");
    expect(shiftIsoDate("2028-01-31", 1)).toBe("2028-02-29");
    expect(shiftIsoDate("2026-01-31", 6)).toBe("2026-07-31");
    expect(shiftIsoDate("2026-11-15", 3)).toBe("2027-02-15");
    expect(shiftIsoDate("2026-12-01", 12)).toBe("2027-12-01");
    expect(shiftIsoDate("2026-03-31", 36)).toBe("2029-03-31");
  });

  it("previews every date the cycle has and where it moves, and nothing it does not have", () => {
    expect(shiftedCycleDates(cycle(), 6)).toEqual([
      { label: "Hired on or before", from: "2026-01-31", to: "2026-07-31" },
      { label: "Self review opens", from: "2026-01-31", to: "2026-07-31" },
      { label: "Self review due", from: "2026-02-14", to: "2026-08-14" },
      { label: "Peer review due", from: "2026-02-28", to: "2026-08-28" },
      { label: "Peers nominated by", from: "2026-02-05", to: "2026-08-05" },
      { label: "Peers approved by", from: "2026-02-10", to: "2026-08-10" },
      { label: "Results released", from: "2026-03-15", to: "2026-09-15" },
    ]);
  });

  it("leaves out the release date of a cycle the manager shares", () => {
    const dates = shiftedCycleDates(cycle({ sharingMode: "MANAGER_SHARES" }), 3);
    expect(dates.map((d) => d.label)).not.toContain("Results released");
  });

  it("accepts one to thirty-six whole months", () => {
    expect(validRepeatMonths(1)).toBe(true);
    expect(validRepeatMonths(36)).toBe(true);
    expect(validRepeatMonths(0)).toBe(false);
    expect(validRepeatMonths(37)).toBe(false);
    expect(validRepeatMonths(2.5)).toBe(false);
  });
});
