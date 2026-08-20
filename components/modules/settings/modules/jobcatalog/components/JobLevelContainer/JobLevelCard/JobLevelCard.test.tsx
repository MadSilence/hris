import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobLevelCard } from "./JobLevelCard";
import { JobLevel, JobLevelGroup } from "@/models/job";

jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const level = (name: string, sortOrder: number, overrides: Partial<JobLevel> = {}): JobLevel => ({
  id: `lvl-${sortOrder}`,
  name,
  sortOrder,
  isSystem: false,
  assignedJobsCount: 0,
  assignedUsersCount: 0,
  ...overrides,
});

const group = (overrides: Partial<JobLevelGroup> = {}): JobLevelGroup => ({
  id: "grp-1",
  name: "Individual Contributor",
  isSystem: false,
  levels: [level("Junior", 1), level("Mid", 2), level("Senior", 3)],
  assignedJobsCount: 7,
  assignedUsersCount: 12,
  ...overrides,
});

const handlers = () => ({
  onToggleManaging: jest.fn(),
  onEditGroup: jest.fn(),
  onDeleteGroup: jest.fn(),
  onCreateLevel: jest.fn(),
  onEditLevel: jest.fn(),
  onDeleteLevel: jest.fn(),
  onMoveLevel: jest.fn(),
});

const renderCard = (managing: boolean, groupOverrides: Partial<JobLevelGroup> = {}) => {
  const props = handlers();
  const g = group(groupOverrides);
  render(<JobLevelCard group={g} managing={managing} {...props} />);
  return { ...props, group: g };
};

describe("JobLevelCard", () => {
  it("shows the real counters instead of a placeholder", () => {
    renderCard(false);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Positions")).toBeInTheDocument();
  });

  it("orders the ladder by sortOrder, not by array order", () => {
    renderCard(false, { levels: [level("Senior", 3), level("Junior", 1), level("Mid", 2)] });

    const rungs = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(rungs).toEqual(["Junior", "Mid", "Senior"]);
  });

  it("hides level actions until Manage Group is pressed", () => {
    const props = renderCard(false);

    expect(screen.queryByLabelText("Move level up")).not.toBeInTheDocument();
    expect(screen.queryByText("Add Level")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Manage Group/ }));
    expect(props.onToggleManaging).toHaveBeenCalledTimes(1);
  });

  it("offers reordering and adding once managing", () => {
    renderCard(true);

    expect(screen.getAllByLabelText("Move level up")).toHaveLength(3);
    expect(screen.getByText("Add Level")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Done/ })).toBeInTheDocument();
  });

  it("cannot move the top rung up or the bottom rung down", () => {
    renderCard(true);

    const ups = screen.getAllByLabelText("Move level up");
    const downs = screen.getAllByLabelText("Move level down");

    expect(ups[0]).toBeDisabled();
    expect(ups[2]).toBeEnabled();
    expect(downs[2]).toBeDisabled();
    expect(downs[0]).toBeEnabled();
  });

  it("moves a rung in the requested direction", () => {
    const props = renderCard(true);

    fireEvent.click(screen.getAllByLabelText("Move level down")[0]);

    expect(props.onMoveLevel).toHaveBeenCalledWith(
      props.group,
      expect.objectContaining({ name: "Junior" }),
      1,
    );
  });

  it("shows every rung while managing, even past the collapse threshold", () => {
    const many = [1, 2, 3, 4, 5, 6].map((i) => level(`L${i}`, i));

    const { rerender } = render(
      <JobLevelCard group={group({ levels: many })} managing={false} {...handlers()} />,
    );
    expect(screen.getByText("+2 more levels")).toBeInTheDocument();

    rerender(<JobLevelCard group={group({ levels: many })} managing {...handlers()} />);
    expect(screen.queryByText("+2 more levels")).not.toBeInTheDocument();
    expect(screen.getByText("L6")).toBeInTheDocument();
  });

  it("shows a dashed empty state for a track with no rungs", () => {
    renderCard(false, { levels: [] });

    expect(screen.getByText("No levels yet")).toBeInTheDocument();
  });

  it("offers rename and delete on the group menu while managing", async () => {
    const user = userEvent.setup();
    const props = renderCard(true);

    await user.click(screen.getByLabelText("Group actions"));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    expect(props.onDeleteGroup).toHaveBeenCalledWith(props.group);
  });
});
