import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { partialMock } from "@/test/types";
import type { EmployeeTimeOffBalance, TimeOffPolicy, TimeOffRequest } from "@/models/timeOff";
import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { useTimeOffRequestDuration } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestDuration";
import { RequestTimeOffModal } from "./RequestTimeOffModal";

jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestDuration", () => ({
  useTimeOffRequestDuration: jest.fn(),
}));
const createRequest = jest.fn();
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCreateTimeOffRequest", () => ({
  useCreateTimeOffRequest: () => ({ isPending: false, mutateAsync: createRequest }),
}));
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useEditTimeOffRequest", () => ({
  useEditTimeOffRequest: () => ({ isPending: false, mutateAsync: jest.fn() }),
}));
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffApproverPreview", () => ({
  useTimeOffApproverPreview: () => ({ data: undefined }),
}));
jest.mock("@/components/modules/calendar/hooks/useUserPublicHolidays", () => ({
  useUserPublicHolidays: () => ({ data: [] }),
}));
jest.mock("@/components/providers/CompanyDataProvider/CompanyDataProvider", () => ({
  useCompanyData: () => ({ company: undefined }),
}));
jest.mock("@/components/modules/timeOff/LeaveMonthGrid", () => ({
  LeaveMonthGrid: ({ onDayClick }: { onDayClick?: (iso: string) => void }) => (
    <button type="button" onClick={() => onDayClick?.("2026-12-08")}>
      pick 8 Dec
    </button>
  ),
}));

const duration = jest.mocked(useTimeOffRequestDuration);

const balance = partialMock<EmployeeTimeOffBalance>({
  id: "b1",
  assignmentId: "a1",
  policyId: "p1",
  periodStart: "2026-01-01",
  periodEnd: null,
  currentBalance: 20,
  availableBalance: 20,
});
const policyMap = new Map<string, TimeOffPolicy>([
  ["p1", partialMock<TimeOffPolicy>({ id: "p1", name: "Annual leave", unlimitedQuota: false })],
]);

const open = (extra: Partial<React.ComponentProps<typeof RequestTimeOffModal>> = {}) =>
  render(
    <RequestTimeOffModal
      isOpen
      userId="u1"
      balances={[balance]}
      policyMap={policyMap}
      initialStartDate="2026-11-20"
      initialEndDate="2026-11-24"
      onCloseAction={jest.fn()}
      {...extra}
    />,
  );

describe("RequestTimeOffModal", () => {
  beforeEach(() => duration.mockReset());

  it("shows the count as loading until the server answers — no calendar-day estimate (W9)", () => {
    duration.mockReturnValue(partialMock({ data: undefined, isError: false }));
    open();
    expect(document.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    // Five calendar days are picked; nothing may guess "5" before the server counts them.
    expect(screen.queryByText(/5/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request time off" })).toBeInTheDocument();
  });

  it("shows the server's count once it answers", () => {
    duration.mockReturnValue(
      partialMock({
        data: { amount: 3, countingMode: TimeOffPolicyCountingMode.WorkingDays, halfDayHolidays: [] },
        isError: false,
      }),
    );
    open();
    expect(document.querySelector('[data-slot="skeleton"]')).toBeNull();
    expect(screen.getByRole("button", { name: "Request 3 days" })).toBeInTheDocument();
  });

  it("says the count failed rather than shimmering for ever", () => {
    duration.mockReturnValue(partialMock({ data: undefined, isError: true }));
    open();
    expect(document.querySelector('[data-slot="skeleton"]')).toBeNull();
    expect(screen.getByText("We couldn’t count the days")).toBeInTheDocument();
  });

  it("is titled Edit dates and saves with Save on one's own waiting request (W13)", () => {
    duration.mockReturnValue(
      partialMock({
        data: { amount: 3, countingMode: TimeOffPolicyCountingMode.WorkingDays, halfDayHolidays: [] },
        isError: false,
      }),
    );
    const editing = partialMock<TimeOffRequest>({
      id: "r1",
      assignmentId: "a1",
      balanceId: "b1",
      startDate: "2026-11-20",
      endDate: "2026-11-24",
      status: TimeOffRequestStatus.Pending,
      requestedAmount: 3,
      reason: null,
    });
    open({ editing });
    expect(screen.getByRole("heading", { name: "Edit dates" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Request/ })).not.toBeInTheDocument();
  });

  it("drops a refusal once other days are picked — it was about the days it was sent with", async () => {
    duration.mockReturnValue(
      partialMock({
        data: { amount: 3, countingMode: TimeOffPolicyCountingMode.WorkingDays, halfDayHolidays: [] },
        isError: false,
      }),
    );
    createRequest.mockRejectedValueOnce(new Error("No balance covers these dates for this policy."));
    open();

    fireEvent.click(screen.getByRole("button", { name: "Request 3 days" }));
    expect(await screen.findByText("No balance covers these dates for this policy.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "pick 8 Dec" }));
    await waitFor(() =>
      expect(screen.queryByText("No balance covers these dates for this policy.")).not.toBeInTheDocument(),
    );
  });
});
