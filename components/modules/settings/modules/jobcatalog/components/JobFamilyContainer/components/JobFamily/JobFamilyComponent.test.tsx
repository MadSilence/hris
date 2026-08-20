import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobFamilyComponent, JobFamilyComponentProps } from "./JobFamilyComponent";
import { Job, JobFamily } from "@/models/job";

// Permission gating is UX only and has its own tests; here it would just hide everything.
jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/modules/settings/shared/ExportDataModal/ExportDataModal", () => ({
  ExportDataModal: ({ isOpen, title }: { isOpen: boolean; title: string }) =>
    isOpen ? <div>{title}</div> : null,
}));

const mockTriggerExportDownload = jest.fn();
jest.mock("@/components/modules/settings/shared/ExportDataModal", () => ({
  triggerExportDownload: (...args: unknown[]) => mockTriggerExportDownload(...args),
}));

const job = (overrides: Partial<Job> = {}): Job => ({
  id: overrides.id ?? "job-1",
  name: "Backend Engineer",
  code: "ENG-01",
  description: null,
  isSystem: false,
  archived: false,
  familyId: "fam-1",
  familyName: "Engineering",
  level: { id: "lvl-1", name: "L3 - Senior" },
  assignedUsersCount: 4,
  ...overrides,
});

const family = (overrides: Partial<JobFamily> = {}): JobFamily => ({
  id: overrides.id ?? "fam-1",
  name: "Engineering",
  description: null,
  isSystem: false,
  archived: false,
  jobs: [job()],
  assignedUsersCount: 4,
  ...overrides,
});

const handlers = (): JobFamilyComponentProps => ({
  jobFamilies: [family()],
  onCreateFamily: jest.fn(),
  onEditFamily: jest.fn(),
  onDuplicateFamily: jest.fn(),
  onArchiveFamily: jest.fn(),
  onActivateFamily: jest.fn(),
  onDeleteFamily: jest.fn(),
  onCreateJob: jest.fn(),
  onEditJob: jest.fn(),
  onDuplicateJob: jest.fn(),
  onArchiveJob: jest.fn(),
  onActivateJob: jest.fn(),
  onDeleteJob: jest.fn(),
});

const renderComponent = (props: Partial<JobFamilyComponentProps> = {}) => {
  const merged = { ...handlers(), ...props };
  render(<JobFamilyComponent {...merged} />);
  return merged;
};

const enterEditMode = () => fireEvent.click(screen.getByLabelText("Edit family"));

describe("JobFamilyComponent", () => {
  it("shows a position with its code, level and headcount", () => {
    renderComponent();

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("ENG-01")).toBeInTheDocument();
    expect(screen.getByText("L3 - Senior")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("keeps archived positions in the list and marks their status", () => {
    renderComponent({ jobFamilies: [family({ jobs: [job({ archived: true })] })] });

    // The row is still there — archived is a status, not a reason to disappear.
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("hides row actions and the add affordance until edit mode is entered", () => {
    renderComponent();

    expect(screen.queryByLabelText("Job actions")).not.toBeInTheDocument();
    expect(screen.queryByText("Add Job")).not.toBeInTheDocument();

    enterEditMode();

    expect(screen.getByLabelText("Job actions")).toBeInTheDocument();
    expect(screen.getByText("Add Job")).toBeInTheDocument();
  });

  it("swaps the empty-state block for Add Job in edit mode", () => {
    renderComponent({ jobFamilies: [family({ jobs: [], assignedUsersCount: 0 })] });

    expect(screen.getByText("No positions in this family yet")).toBeInTheDocument();
    expect(screen.queryByText("Add Job")).not.toBeInTheDocument();

    enterEditMode();

    expect(screen.queryByText("No positions in this family yet")).not.toBeInTheDocument();
    expect(screen.getByText("Add Job")).toBeInTheDocument();
  });

  it("offers Add Job for the family it sits in", () => {
    const props = renderComponent();

    enterEditMode();
    fireEvent.click(screen.getByText("Add Job"));

    expect(props.onCreateJob).toHaveBeenCalledWith(expect.objectContaining({ id: "fam-1" }));
  });

  it("offers Archive on an active position", async () => {
    const user = userEvent.setup();
    const props = renderComponent();

    enterEditMode();
    await user.click(screen.getByLabelText("Job actions"));
    await user.click(await screen.findByRole("menuitem", { name: "Archive" }));

    expect(props.onArchiveJob).toHaveBeenCalledWith(expect.objectContaining({ id: "job-1" }));
  });

  it("offers Restore instead of Archive on an archived position", async () => {
    const user = userEvent.setup();
    const props = renderComponent({ jobFamilies: [family({ jobs: [job({ archived: true })] })] });

    enterEditMode();
    await user.click(screen.getByLabelText("Job actions"));

    // Plain text item, no icon — same as every other entry in the menu.
    expect(await screen.findByRole("menuitem", { name: "Restore" })).toHaveTextContent(/^Restore$/);
    expect(screen.queryByRole("menuitem", { name: "Archive" })).not.toBeInTheDocument();
    await user.click(await screen.findByRole("menuitem", { name: "Restore" }));

    expect(props.onActivateJob).toHaveBeenCalledWith(expect.objectContaining({ id: "job-1" }));
  });

  it("filters by job code as well as by name", () => {
    renderComponent({
      jobFamilies: [
        family({ jobs: [job({ id: "job-1", name: "Backend Engineer", code: "ENG-01" })] }),
        family({
          id: "fam-2",
          name: "Design",
          jobs: [job({ id: "job-2", name: "Product Designer", code: "DES-01" })],
        }),
      ],
    });

    fireEvent.change(screen.getByPlaceholderText("Search jobs"), { target: { value: "DES-" } });

    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.queryByText("Backend Engineer")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Search jobs"), { target: { value: "zzz" } });

    expect(screen.getByText("Nothing matches your search.")).toBeInTheDocument();
  });

  it("counts positions on the family header", () => {
    renderComponent({
      jobFamilies: [family({ jobs: [job({ id: "a" }), job({ id: "b" })] })],
    });

    const header = screen.getByRole("button", { name: /Engineering/ });
    expect(within(header).getByText("(2)")).toBeInTheDocument();
  });
});
