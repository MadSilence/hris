import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { CompanyState, GoLivePreview, GoLiveStatus } from "@/models/demo";
import { ActionStatus } from "@/components/models/ActionStatus";
import { GoLiveContainer } from "./GoLiveContainer";

let state: CompanyState;
let status: GoLiveStatus | null = null;
let preview: GoLivePreview;
const requestGoLiveAction = jest.fn();

jest.mock("@/components/modules/demo/hooks", () => ({
  useCompanyState: () => ({ data: state, error: null }),
  useGoLiveStatus: () => ({ data: status, error: null, isLoading: false, isSuccess: true }),
  useGoLivePreview: () => ({ data: preview, error: null }),
  useInvalidateDemo: () => jest.fn(),
}));
jest.mock("@/components/modules/demo/actions/goLiveActions", () => ({
  requestGoLiveAction: (...args: unknown[]) => requestGoLiveAction(...args),
  retryGoLiveAction: jest.fn(),
}));
jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn() }));

const trial: CompanyState = {
  status: "TRIALING",
  writable: true,
  isDemo: true,
  trialEndsAt: "2026-11-28T10:00:00Z",
  trialDaysLeft: 9,
  readOnlySince: null,
  goLive: null,
};

/** Settings → Go live (DEMO_PLAN.md 6.6; R5.3, P3). */
describe("GoLiveContainer", () => {
  beforeEach(() => {
    state = trial;
    status = null;
    requestGoLiveAction.mockReset();
    preview = {
      isDemo: true,
      items: [
        { kind: "ORG_UNIT", id: "d1", name: "Engineering", detail: "DEPARTMENT", keep: true, reason: "EDITED" },
        { kind: "OFFICE", id: "o1", name: "London Office", detail: null, keep: false, reason: "SAMPLE" },
      ],
      counts: { samplePeople: 24, timeOffRequests: 7, journalLines: 120 },
    };
  });

  it("lists what goes regardless and what to keep, with the suggestion chosen", () => {
    render(<GoLiveContainer />);
    expect(screen.getByText("24 sample people")).toBeInTheDocument();
    expect(screen.getByText("7 time off requests")).toBeInTheDocument();
    expect(screen.getByText("You changed it")).toBeInTheDocument();
    expect(screen.getByText("From the example")).toBeInTheDocument();
  });

  it("asks once, naming what cannot be undone, and sends what is kept", async () => {
    requestGoLiveAction.mockResolvedValue({ status: ActionStatus.SUCCESS, data: null });
    render(<GoLiveContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Request activation" }));
    expect(screen.getByText(/This cannot be undone, and there is no way back to the demo\./)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Request activation" }).at(-1)!);

    await waitFor(() => expect(requestGoLiveAction).toHaveBeenCalledWith(["ORG_UNIT:d1"]));
  });

  it("an empty trial has nothing to choose: activation only", () => {
    preview = { isDemo: false, items: [], counts: {} };
    state = { ...trial, isDemo: false };
    render(<GoLiveContainer />);
    expect(screen.getByText("Your company has no sample data")).toBeInTheDocument();
    expect(screen.queryByText("What to keep")).not.toBeInTheDocument();
    expect(screen.queryByText(/the sample people and everything done in the demo are deleted/)).not.toBeInTheDocument();
  });

  it("after asking, says it waits for activation and offers nothing to change", () => {
    status = {
      status: "REQUESTED", step: null, requestedAt: "2026-11-14T10:00:00Z", requestedByName: "Petr K",
      activatedAt: null, activatedBy: null, finishedAt: null, counts: null, errorDetail: null,
    };
    render(<GoLiveContainer />);
    expect(screen.getByText(/Waiting for activation/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request activation" })).not.toBeInTheDocument();
  });
});
