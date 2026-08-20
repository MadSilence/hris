import { fireEvent, render, screen } from "@testing-library/react";
import { CatalogImpactModal } from "./CatalogImpactModal";

const baseProps = {
  isOpen: true,
  isLoading: false,
  action: "archive" as const,
  entityLabel: "job",
  entityName: "Backend Engineer",
  affectedPeople: 0,
  onConfirmAction: jest.fn(),
  onRequestCloseAction: jest.fn(),
};

describe("CatalogImpactModal", () => {
  it("leads with how many people lose the position", () => {
    render(<CatalogImpactModal {...baseProps} affectedPeople={3} />);

    expect(screen.getByText(/3 people/)).toBeInTheDocument();
    expect(screen.getByText(/will lose their position/)).toBeInTheDocument();
  });

  it("says so plainly when nobody is affected", () => {
    render(<CatalogImpactModal {...baseProps} affectedPeople={0} />);

    expect(screen.getByText("Nobody currently holds this position.")).toBeInTheDocument();
  });

  it("uses the singular for one person", () => {
    render(<CatalogImpactModal {...baseProps} affectedPeople={1} />);

    expect(screen.getByText(/1 person/)).toBeInTheDocument();
  });

  it("warns that a family takes its positions with it", () => {
    render(
      <CatalogImpactModal
        {...baseProps}
        action="delete"
        entityLabel="job family"
        entityName="Engineering"
        affectedPeople={5}
        affectedJobs={7}
      />,
    );

    expect(screen.getByText(/7/)).toBeInTheDocument();
    expect(screen.getByText(/will be deleted too/)).toBeInTheDocument();
  });

  it("calls back to archive without closing itself, so a failure has somewhere to render", () => {
    const onConfirmAction = jest.fn();
    const onRequestCloseAction = jest.fn();

    render(
      <CatalogImpactModal
        {...baseProps}
        onConfirmAction={onConfirmAction}
        onRequestCloseAction={onRequestCloseAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Archive job" }));

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
    expect(onRequestCloseAction).not.toHaveBeenCalled();
  });

  it("renders a server-side failure instead of swallowing it", () => {
    render(<CatalogImpactModal {...baseProps} errorMessage="Job is already archived" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Job is already archived");
  });
});
