import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import type { TimeOffDecisionContext } from "@/models/timeOff";
import type { TimeOffApprovalStepDTO } from "@/api/modules/timeOff/timeOffRequests/dto";
import { partialMock } from "@/test/types";
import { LeaveRequestDialog } from "./LeaveRequestDialog";

let mockContext: TimeOffDecisionContext;
const mockApprove = jest.fn();
const mockCancel = jest.fn();
const mockDecideCancellation = jest.fn();
let mockMe = "me";

jest.mock("@/components/modules/timeOff/lib/requestQuery", () => ({
  timeOffDecisionQueryKey: (id: string) => ["TIME_OFF_DECISION_CONTEXT", id],
  useLeaveRequestContext: () => ({ isLoading: false, error: null, data: mockContext, refetch: jest.fn() }),
}));
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn(), fetchQuery: jest.fn().mockResolvedValue(null) }),
}));
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies", () => ({
  useTimeOffPolicies: () => ({ data: [{ id: "p1", name: "Annual leave", color: "blue", unlimitedQuota: false }] }),
}));
jest.mock("@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser", () => ({
  useEmployeeTimeOffBalancesByUser: () => ({ data: [] }),
}));
jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: () => ({ userId: mockMe, user: { firstName: "Lena", lastName: "Novak", avatarUrl: null } }),
}));
jest.mock("@/components/providers/CompanyDataProvider/CompanyDataProvider", () => ({
  useCompanyData: () => ({ company: undefined }),
}));
jest.mock("@/components/modules/calendar/hooks/useUserPublicHolidays", () => ({ useUserPublicHolidays: () => ({ data: [] }) }));
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest", () => ({
  useApproveTimeOffRequest: () => ({ mutateAsync: mockApprove, isPending: false }),
}));
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCancelTimeOffRequest", () => ({
  useCancelTimeOffRequest: () => ({ mutateAsync: mockCancel, isPending: false }),
}));
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation", () => ({
  useDecideCancellation: () => ({ mutateAsync: mockDecideCancellation, isPending: false }),
}));
jest.mock("@/components/modules/notifications/hooks/useNotifications", () => ({ useInvalidateNotifications: () => jest.fn() }));
jest.mock("@/components/modules/timeOff/LeaveMonthGrid", () => ({ LeaveDays: () => null }));
jest.mock("@/components/modules/timeOff/DeclineLeaveDialog", () => ({
  DeclineLeaveDialog: ({ target }: { target: { firstName?: string } | null }) =>
    target ? <div data-test="decline">{`decline ${target.firstName}`}</div> : null,
}));
jest.mock("@/components/modules/timeOff/CancelLeaveRequestDialog", () => ({
  CancelLeaveRequestDialog: ({ request }: { request: unknown }) => (request ? <div data-test="cancel-confirm" /> : null),
}));
jest.mock("@/components/modules/calendar/components/UserTimeOffBalances/RequestTimeOffModal", () => ({
  RequestTimeOffModal: () => <div data-test="edit-dates" />,
}));
jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn() }));

const step = (over: Partial<TimeOffApprovalStepDTO>): TimeOffApprovalStepDTO => ({
  approvalOrder: 1,
  approverType: "SPECIFIC_USER",
  askedUserId: null,
  askedUserName: null,
  askedRoleName: null,
  askedReason: "RESOLVED",
  reassignedToUserId: null,
  reassignedToName: null,
  signed: false,
  decidedBy: null,
  decidedByName: null,
  via: null,
  onBehalfOfUserId: null,
  onBehalfOfName: null,
  decidedAt: null,
  ...over,
});

const context = (over: Partial<TimeOffDecisionContext> & { status?: string } = {}): TimeOffDecisionContext => {
  const { status = "PENDING", ...rest } = over;
  return partialMock<TimeOffDecisionContext>({
    request: partialMock<TimeOffDecisionContext["request"]>({
      id: "r1",
      userId: "ruta",
      policyId: "p1",
      status: status as TimeOffDecisionContext["request"]["status"],
      startDate: "2026-11-30",
      endDate: "2026-12-04",
      requestedAmount: 5,
      reason: "Christmas shopping trip to Vienna",
      createdAt: "2026-11-19T10:00:00",
      approvedAt: status === "PENDING" ? null : "2026-11-20T10:42:00Z",
      countingMode: "WORKING_DAYS" as TimeOffDecisionContext["request"]["countingMode"],
      cancellationReason: null,
      rejectionReason: null,
    }),
    requesterName: "Rūta Jankauskienė",
    balance: partialMock<NonNullable<TimeOffDecisionContext["balance"]>>({ currentBalance: 18, pendingBalance: 5, availableBalance: 13 }),
    awaitingYou: false,
    canDecideAnyway: false,
    steps: [],
    workingDays: true,
    chain: null,
    cancelNeedsApproval: true,
    ...rest,
  });
};

beforeEach(() => {
  mockMe = "me";
  mockApprove.mockReset().mockResolvedValue({});
  mockCancel.mockReset().mockResolvedValue({});
  mockDecideCancellation.mockReset().mockResolvedValue({});
});

const open = () => render(<LeaveRequestDialog requestId="r1" onClose={jest.fn()} />);

describe("LeaveRequestDialog — the request in full (Q30, AQ-16, AQ-04)", () => {
  it("gives the requester's waiting request Cancel request and Edit dates, and a count without names (AQ16a, AQ04c)", () => {
    mockMe = "ruta";
    mockContext = context({ chain: { mode: "SEQUENTIAL", ordered: true, total: 3, required: 3, approved: 1, approvedByNames: [] } });
    open();
    expect(screen.getByText("Waiting for approval")).toBeInTheDocument();
    expect(screen.getByText("1 of 3 approved")).toBeInTheDocument();
    expect(screen.getByText("−5 working days")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel request" }));
    expect(screen.getByTestId("cancel-confirm")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit dates" }));
    expect(screen.getByTestId("edit-dates")).toBeInTheDocument();
  });

  it("offers Ask to cancel on the requester's approved leave ahead, and names every approver (AQ16b)", async () => {
    mockMe = "ruta";
    mockContext = context({
      status: "APPROVED",
      request: { ...context().request, status: "APPROVED" as never, startDate: "2099-11-30", endDate: "2099-12-04", approvedAt: "2026-11-20T10:42:00Z" },
      chain: { mode: "SEQUENTIAL", ordered: true, total: 2, required: 2, approved: 2, approvedByNames: ["Meryem Alaoui", "Tomas Petrauskas"] },
    });
    open();
    expect(screen.getByText("Approved by Meryem Alaoui, Tomas Petrauskas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ask to cancel" }));
    await waitFor(() => expect(mockCancel).toHaveBeenCalledWith({ requestId: "r1", userId: "ruta", cancellationReason: null }));
  });

  it("says Cancel time off when the policy lets the requester cancel approved leave without asking", async () => {
    mockMe = "ruta";
    mockContext = context({
      status: "APPROVED",
      request: { ...context().request, status: "APPROVED" as never, startDate: "2099-11-30", endDate: "2099-12-04" },
      cancelNeedsApproval: false,
    });
    open();
    expect(screen.queryByRole("button", { name: "Ask to cancel" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel time off" }));
    await waitFor(() => expect(mockCancel).toHaveBeenCalledWith({ requestId: "r1", userId: "ruta", cancellationReason: null }));
  });

  it("turns the balance row red and the button into Approve anyway when the balance is short (AQ16d)", () => {
    mockContext = context({
      awaitingYou: true,
      balance: partialMock<NonNullable<TimeOffDecisionContext["balance"]>>({ currentBalance: 3, pendingBalance: 5, availableBalance: -2 }),
    });
    open();
    expect(screen.getByText("Waiting for you")).toBeInTheDocument();
    expect(screen.getByText("Rūta has 3 days left")).toBeInTheDocument();
    expect(screen.getByText("−2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    expect(screen.getByTestId("decline")).toHaveTextContent("decline Rūta");
    fireEvent.click(screen.getByRole("button", { name: "Approve anyway" }));
    expect(mockApprove).toHaveBeenCalledWith({ requestId: "r1" });
  });

  it("keeps the badge Approved while its approver answers a cancel ask (AQ16c)", async () => {
    mockContext = context({
      status: "CANCELLATION_PENDING",
      awaitingYou: true,
      request: { ...context().request, status: "CANCELLATION_PENDING" as never, cancellationReason: "The trip moved to January" },
    });
    open();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Rūta asks to cancel this time off")).toBeInTheDocument();
    expect(screen.getByText("The 5 days go back to Rūta’s balance if you agree")).toBeInTheDocument();
    expect(screen.getByText("+5 working days back")).toBeInTheDocument();
    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("The trip moved to January")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel time off" }));
    await waitFor(() =>
      expect(mockDecideCancellation).toHaveBeenCalledWith({ requestId: "r1", userId: "ruta", decision: "CONFIRM" }),
    );
    expect(screen.getByRole("button", { name: "Keep it" })).toBeInTheDocument();
  });

  it("draws a chain of several for an approver as steps, in order, with the reader as You (AQ04a)", () => {
    mockContext = context({
      awaitingYou: true,
      chain: { mode: "SEQUENTIAL", ordered: true, total: 3, required: 3, approved: 1, approvedByNames: [] },
      steps: [
        step({ approvalOrder: 1, approverType: "MANAGER", askedUserId: "m", askedUserName: "Meryem Alaoui", signed: true,
          decidedByName: "Meryem Alaoui", decidedAt: "2026-11-20T10:00:00Z", state: "DONE" }),
        step({ approvalOrder: 2, askedUserId: "me", askedUserName: "Lena Novak", state: "NOW" }),
        step({ approvalOrder: 3, askedUserId: "t", askedUserName: "Tomas Petrauskas", state: "NOT_YET" }),
      ],
    });
    open();
    const list = screen.getByText("Who approves").closest("div")!.parentElement!;
    expect(within(list).getByText("1 of 3 approved")).toBeInTheDocument();
    expect(within(list).getByText("You")).toBeInTheDocument();
    expect(within(list).getByText("Waiting for you")).toBeInTheDocument();
    expect(within(list).getByText("After you")).toBeInTheDocument();
    expect(within(list).getByText(/^Manager · Approved/)).toBeInTheDocument();
    expect(screen.queryByText("Waiting for approval")).not.toBeInTheDocument();
  });

  it("counts an any-N chain without an \"of\": \"1 approved\" (STEPS.md, 2026-11-20)", () => {
    mockContext = context({
      awaitingYou: true,
      chain: { mode: "N_OF_M", ordered: false, total: 3, required: 2, approved: 1, approvedByNames: [] },
      steps: [
        step({ approvalOrder: 1, askedUserId: "m", askedUserName: "Meryem Alaoui", state: "NOW" }),
        step({ approvalOrder: 2, askedUserId: "t", askedUserName: "Tomas Petrauskas", signed: true,
          decidedByName: "Tomas Petrauskas", decidedAt: "2026-11-20T10:00:00Z", state: "DONE" }),
        step({ approvalOrder: 3, askedUserId: "me", askedUserName: "Lena Novak", state: "NOW" }),
      ],
    });
    open();
    const list = screen.getByText("Any 2 of 3").closest("div")!.parentElement!;
    expect(within(list).getByText("1 approved")).toBeInTheDocument();
    expect(within(list).queryByText("1 of 2 approved")).not.toBeInTheDocument();
  });

  it("says the approver's job title on the role line when the step carries one (C5)", () => {
    mockContext = context({
      awaitingYou: true,
      chain: { mode: "SEQUENTIAL", ordered: true, total: 2, required: 2, approved: 1, approvedByNames: [] },
      steps: [
        step({ approvalOrder: 1, approverType: "MANAGER", askedUserId: "m", askedUserName: "Meryem Alaoui", signed: true,
          decidedByName: "Meryem Alaoui", decidedAt: "2026-11-20T10:00:00Z", state: "DONE",
          approverJobTitle: "Head of Design" }),
        step({ approvalOrder: 2, askedUserId: "me", askedUserName: "Lena Novak", state: "NOW" }),
      ],
    });
    open();
    const list = screen.getByText("Who approves").closest("div")!.parentElement!;
    expect(within(list).getByText(/^Head of Design · Approved/)).toBeInTheDocument();
    expect(within(list).queryByText(/^Manager ·/)).not.toBeInTheDocument();
  });
});
