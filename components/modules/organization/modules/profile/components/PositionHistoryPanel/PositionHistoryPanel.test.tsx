import { render, screen } from "@testing-library/react";
import { PositionHistoryPanel } from "./PositionHistoryPanel";
import { useUserJobHistory } from "@/components/modules/organization/modules/profile/hooks/useUserJobHistory";
import { ForbiddenError } from "@/components/clients/exceptions";
import { formatDisplayDate } from "@/lib/date";
import type { User } from "@/models/user/User";
import type { PositionHistoryEntry } from "@/models/user/PositionHistoryEntry";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/organization/modules/profile/hooks/useUserJobHistory", () => ({
  useUserJobHistory: jest.fn(),
}));

/** The part of the query result the panel reads. */
type HookStub = { data?: PositionHistoryEntry[]; isLoading?: boolean; error?: Error | null };

const mockHook = (value: HookStub) =>
  (useUserJobHistory as jest.Mock).mockReturnValue({
    data: undefined, isLoading: false, error: null, refetch: jest.fn(), ...value,
  });

const withPosition = partialMock<User>({
  id: "user-1",
  firstName: "Anna",
  lastName: "Berg",
  jobId: "job-2",
  fieldAccess: { "sys:job": "VIEW" },
});

const withoutPosition = partialMock<User>({
  id: "user-1",
  firstName: "Anna",
  lastName: "Berg",
  fieldAccess: { "sys:email": "VIEW" },
});

const entries: PositionHistoryEntry[] = [
  { id: "h2", changedAt: "2026-09-20", jobName: null, previousJobName: "Backend Engineer", reason: "JOB_DELETED" },
  { id: "h1", changedAt: "2026-09-01", jobName: "Backend Engineer", previousJobName: null, reason: "ASSIGNED" },
];

describe("PositionHistoryPanel", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders nothing, and asks for nothing, when the reader may not see the position", () => {
    mockHook({});

    const { container } = render(<PositionHistoryPanel userId="user-1" user={withoutPosition}/>);

    expect(container).toBeEmptyDOMElement();
    expect(useUserJobHistory).toHaveBeenCalledWith("user-1", { enabled: false, currentJobId: undefined });
  });

  it("asks for the timeline keyed on the current position when the position is visible", () => {
    mockHook({ data: entries });

    render(<PositionHistoryPanel userId="user-1" user={withPosition}/>);

    expect(useUserJobHistory).toHaveBeenCalledWith("user-1", { enabled: true, currentJobId: "job-2" });
  });

  it("shows skeleton rows under the real header while loading", () => {
    mockHook({ isLoading: true });

    render(<PositionHistoryPanel userId="user-1" user={withPosition}/>);

    expect(screen.getByRole("columnheader", { name: "From" })).toBeInTheDocument();
    expect(screen.getAllByTestId("position-history-skeleton-row")).toHaveLength(3);
  });

  it("lists each change with its date, the snapshotted names and the reason", () => {
    mockHook({ data: entries });

    render(<PositionHistoryPanel userId="user-1" user={withPosition}/>);

    const rows = screen.getAllByRole("row");
    // Header plus two entries, newest first as the server sent them.
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent(formatDisplayDate("2026-09-20", { style: "medium" }));
    expect(rows[1]).toHaveTextContent("Backend Engineer");
    expect(rows[1]).toHaveTextContent("Position deleted");
    expect(rows[2]).toHaveTextContent("Set on the profile");
    expect(screen.getByText("Each date is the day the change was recorded.")).toBeInTheDocument();
  });

  it("shows a designed empty state when nothing has been recorded", () => {
    mockHook({ data: [] });

    render(<PositionHistoryPanel userId="user-1" user={withPosition}/>);

    expect(screen.getByText("No position changes yet")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows a failed read in the panel, not as an empty timeline", () => {
    mockHook({ error: new ForbiddenError("Forbidden") });

    render(<PositionHistoryPanel userId="user-1" user={withPosition}/>);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("No position changes yet")).not.toBeInTheDocument();
  });
});
