import { render, screen } from "@testing-library/react";
import type { Nomination } from "@/models/reviews";
import { NominationContainer } from "./NominationContainer";

let nomination: Nomination;

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));
jest.mock("@/components/modules/reviews/hooks", () => ({
  useReviewNomination: () => ({ data: nomination, error: null }),
  useInvalidateReviews: () => jest.fn(),
}));
jest.mock("@/components/modules/reviews/actions/reviewCycleActions", () => ({
  approvePeersAction: jest.fn(),
  nominatePeersAction: jest.fn(),
}));
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => ({
  UserPickerField: () => null,
}));

const approved = (autoApproved: boolean): Nomination => ({
  participantId: "p",
  cycleId: "c",
  cycleName: "Walk Nominate 2",
  subject: { userId: "liam", name: "Liam Ramirez" },
  manager: { userId: "emma", name: "Emma Rodriguez" },
  approver: { userId: "emma", name: "Emma Rodriguez" },
  status: "APPROVED",
  nominationDueOn: "2026-11-19",
  approvalDueOn: "2026-11-21",
  peerMin: 2,
  peerMax: 3,
  peers: [{ userId: "a", name: "Isabella Allen" }],
  peersAsked: 3,
  excluded: [],
  nominatedAt: "2026-11-14T13:39:55Z",
  approvedAt: "2026-11-14T13:40:56Z",
  autoApproved,
  canNominate: false,
  canApprove: false,
});

/** The person's own view once the peers are settled (REVIEWS_PLAN.md 10.2, A7). */
describe("NominationContainer", () => {
  it("names who approved a list somebody approved", () => {
    nomination = approved(false);
    render(<NominationContainer participantId="p" />);
    expect(screen.getByText("Walk Nominate 2 · approved by Emma Rodriguez")).toBeInTheDocument();
    expect(screen.getByText("3 peers were asked.")).toBeInTheDocument();
  });

  // Walk of 2026-11-14: the page said "approved by Emma Rodriguez" over "Nobody approved by the approval date".
  it("names nobody when the nomination stood because nobody approved it", () => {
    nomination = approved(true);
    render(<NominationContainer participantId="p" />);
    expect(screen.getByText("Walk Nominate 2")).toBeInTheDocument();
    expect(screen.queryByText(/approved by Emma Rodriguez/)).not.toBeInTheDocument();
    expect(screen.getByText(/^Nobody approved by the approval date/)).toBeInTheDocument();
  });
});
