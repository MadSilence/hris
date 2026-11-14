import { render, screen } from "@testing-library/react";
import type { CompanyState } from "@/models/demo";
import { DemoBanner } from "./DemoBanner";

let state: CompanyState | undefined;
let owner = true;

jest.mock("@/components/modules/demo/hooks", () => ({
  useCompanyState: () => ({ data: state }),
}));
jest.mock("@/components/auth/useAccess", () => ({
  useAccess: () => ({ access: owner ? { systemOwner: true } : { systemOwner: false, permissions: {} } }),
}));

const company = (overrides: Partial<CompanyState>): CompanyState => ({
  status: "TRIALING",
  writable: true,
  isDemo: false,
  trialEndsAt: "2026-11-28T10:00:00Z",
  trialDaysLeft: 14,
  readOnlySince: null,
  goLive: null,
  ...overrides,
});

/** The company's state on every page (DEMO_PLAN.md 4.2, the owner's B1). */
describe("DemoBanner", () => {
  beforeEach(() => {
    owner = true;
  });

  it("says a demo is a demo, counts the trial and offers Go live to the owner", () => {
    state = company({ isDemo: true, trialDaysLeft: 9 });
    render(<DemoBanner />);
    expect(screen.getByText(/This is a demo company with sample people\. 9 days left in the trial\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go live" })).toHaveAttribute("href", "/settings/admin/subscription");
  });

  it("tells somebody who may not go live whom to ask, with no button", () => {
    owner = false;
    state = company({ isDemo: true });
    render(<DemoBanner />);
    expect(screen.getByText(/Ask your account owner to go live\./)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Go live" })).not.toBeInTheDocument();
  });

  it("counts an empty trial's days without calling it a demo", () => {
    state = company({ trialDaysLeft: 1 });
    render(<DemoBanner />);
    expect(screen.getByText("1 day left in your trial.")).toBeInTheDocument();
  });

  it("says a company whose trial ended is read-only", () => {
    state = company({ status: "READ_ONLY", writable: false, trialDaysLeft: null });
    render(<DemoBanner />);
    expect(screen.getByText(/Your trial has ended\./)).toBeInTheDocument();
  });

  it("follows a request to go live instead of offering it again", () => {
    state = company({ isDemo: true, goLive: "REQUESTED" });
    render(<DemoBanner />);
    expect(screen.getByText(/You asked to go live/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open" })).toBeInTheDocument();
  });

  it("shows nothing for a live company", () => {
    state = company({ status: "ACTIVE", trialDaysLeft: null, trialEndsAt: null });
    const { container } = render(<DemoBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
