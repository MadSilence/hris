import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AutomationsPage } from "./AutomationsPage";

const replace = jest.fn();
let search = "";
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace }),
  usePathname: () => "/automations",
  useSearchParams: () => new URLSearchParams(search),
}));

let canManage = true;
jest.mock("@/components/auth/useAccess", () => ({ useCanAccess: () => canManage }));

const activityProps: Record<string, unknown>[] = [];
jest.mock("@/components/modules/automations/activity", () => ({
  isActivityChip: (value: string | null) => ["ALL", "FAILED", "WAITING", "NEXT_7_DAYS"].includes(value ?? ""),
  ActivityTab: (props: Record<string, unknown> & { onRunChange: (id: string | null) => void }) => {
    activityProps.push(props);
    return (
      <button type="button" onClick={() => props.onRunChange("r5")}>
        activity tab
      </button>
    );
  },
}));
jest.mock("./AutomationsListContainer", () => ({ AutomationsListContainer: () => <div>automations tab</div> }));
jest.mock("./NewAutomationDialog", () => ({
  NewAutomationDialog: ({ open }: { open: boolean }) => (open ? <div>new automation dialog</div> : null),
}));

beforeEach(() => {
  replace.mockReset();
  activityProps.length = 0;
  canManage = true;
  search = "";
});

describe("the Automations page", () => {
  it("opens on the list, with Add automation for a manager", () => {
    render(<AutomationsPage />);

    expect(screen.getByRole("heading", { name: "Automations" })).toBeInTheDocument();
    expect(screen.getByText("automations tab")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add automation" }));
    expect(screen.getByText("new automation dialog")).toBeInTheDocument();
  });

  it("tells a viewer they may only look, and offers no Add (E6)", () => {
    canManage = false;
    render(<AutomationsPage />);

    expect(screen.getByText("You can view automations, not change them")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add automation" })).not.toBeInTheDocument();
  });

  it("reads Activity's deep link from the address", () => {
    search = "tab=activity&automation=a1&run=r1&chip=FAILED&why=1";
    render(<AutomationsPage />);

    expect(activityProps[0]).toEqual(
      expect.objectContaining({ automationId: "a1", runId: "r1", initialChip: "FAILED", openLatest: true }),
    );
    expect(screen.queryByRole("button", { name: "Add automation" })).not.toBeInTheDocument();
  });

  it("writes an opened run into the address, keeping the rest", () => {
    search = "tab=activity&automation=a1&why=1";
    render(<AutomationsPage />);

    fireEvent.click(screen.getByText("activity tab"));

    expect(replace).toHaveBeenCalledWith("/automations?tab=activity&automation=a1&run=r5", { scroll: false });
  });
});
