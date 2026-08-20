import { fireEvent, render, screen } from "@testing-library/react";
import { JobLevelDeleteModal } from "./JobLevelDeleteModal";

const baseProps = {
  isOpen: true,
  isLoading: false,
  entityLabel: "level",
  entityName: "L3 - Senior",
  affectedJobs: 0,
  affectedPeople: 0,
  onConfirmAction: jest.fn(),
  onRequestCloseAction: jest.fn(),
};

describe("JobLevelDeleteModal", () => {
  it("says the positions lose their level and keep everything else", () => {
    render(<JobLevelDeleteModal {...baseProps} affectedJobs={4} affectedPeople={9} />);

    expect(screen.getByText(/will lose their level and keep everything else/)).toBeInTheDocument();
    // The distinction that matters: this is a catalogue change, not a firing.
    expect(screen.getByText(/nobody loses their job/)).toBeInTheDocument();
  });

  it("says so plainly when no position uses the level", () => {
    render(<JobLevelDeleteModal {...baseProps} />);

    expect(screen.getByText("No positions use this level.")).toBeInTheDocument();
  });

  it("warns that a group takes its levels with it", () => {
    render(
      <JobLevelDeleteModal
        {...baseProps}
        entityLabel="group"
        entityName="Individual Contributor"
        affectedJobs={7}
        affectedPeople={12}
        affectedLevels={5}
      />,
    );

    expect(screen.getByText(/will be deleted too/)).toBeInTheDocument();
  });

  it("explains up front that a clashing delete is refused", () => {
    render(<JobLevelDeleteModal {...baseProps} affectedJobs={2} />);

    expect(screen.getByText(/the delete\s+is refused if that would happen/)).toBeInTheDocument();
  });

  it("stays open on confirm so a refusal has somewhere to render", () => {
    const onConfirmAction = jest.fn();
    const onRequestCloseAction = jest.fn();

    render(
      <JobLevelDeleteModal
        {...baseProps}
        onConfirmAction={onConfirmAction}
        onRequestCloseAction={onRequestCloseAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete level" }));

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
    expect(onRequestCloseAction).not.toHaveBeenCalled();
  });

  it("renders the backend refusal", () => {
    render(
      <JobLevelDeleteModal
        {...baseProps}
        errorMessage="Removing this level would leave duplicate positions: Backend Engineer."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Backend Engineer");
  });
});
