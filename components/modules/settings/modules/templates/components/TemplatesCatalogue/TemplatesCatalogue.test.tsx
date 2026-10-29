import { render, screen, within } from "@testing-library/react";
import { TemplatesCatalogue } from "./TemplatesCatalogue";
import type { TemplateSummaryDTO } from "@/api/modules/templates/dto";
import { useTemplates } from "@/components/modules/settings/modules/templates/hooks";

jest.mock("@/components/modules/settings/modules/templates/hooks", () => ({
  useTemplates: jest.fn(),
}));

const entry = (over: Partial<TemplateSummaryDTO>): TemplateSummaryDTO => ({
  key: "role.hr-admin",
  version: 1,
  kind: "ROLE",
  title: "HR Admin",
  summary: "Runs HR.",
  changelog: null,
  itemCount: 1,
  suggested: true,
  appliedVersion: null,
  appliedAt: null,
  ...over,
});

const catalogue = [
  entry({}),
  entry({ key: "process.standard-onboarding", kind: "PROCESS", title: "Standard Onboarding", suggested: false }),
  entry({
    key: "field-set.work-authorisation", kind: "FIELD_SET", title: "Work Authorisation", suggested: false,
    itemCount: 3, appliedVersion: 1, appliedAt: "2026-10-29T10:00:00", version: 2,
  }),
];

describe("TemplatesCatalogue", () => {
  beforeEach(() => {
    (useTemplates as jest.Mock).mockReturnValue({ data: catalogue, isLoading: false, error: null, refetch: jest.fn() });
  });

  /** T1: field sets first, then roles, then checklists. */
  it("groups the catalogue by kind, field sets first", () => {
    render(<TemplatesCatalogue/>);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(["Field Sets", "Roles", "Onboarding Checklists"]);
  });

  /** "Applied", not "still there" — and a newer version says so. */
  it("says which version the company applied, and that a newer one exists", () => {
    render(<TemplatesCatalogue/>);
    const row = screen.getByRole("link", { name: /work authorisation/i });
    expect(within(row).getByText(/applied v1/i)).toBeInTheDocument();
    expect(within(row).getByText(/v2 available/i)).toBeInTheDocument();
    expect(row).toHaveAttribute("href", "/settings/general/templates/field-set.work-authorisation");
  });

  it("shows one kind when asked, for Add from Library", () => {
    render(<TemplatesCatalogue kind="FIELD_SET"/>);
    expect(screen.getByText("Work Authorisation")).toBeInTheDocument();
    expect(screen.queryByText("HR Admin")).not.toBeInTheDocument();
  });

  it("says there is nothing to apply rather than drawing an empty list", () => {
    (useTemplates as jest.Mock).mockReturnValue({ data: [], isLoading: false, error: null, refetch: jest.fn() });
    render(<TemplatesCatalogue/>);
    expect(screen.getByText(/no templates to apply/i)).toBeInTheDocument();
  });
});
