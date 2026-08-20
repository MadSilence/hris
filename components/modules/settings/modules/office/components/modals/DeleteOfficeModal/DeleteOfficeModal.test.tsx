import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteOfficeModal } from "./DeleteOfficeModal";
import { Office } from "@/models/office";

// Rewritten to match the modal as it stands: it moved to the desact AlertDialog and renamed its
// callbacks to *Action, so the old hand-rolled Modal/Button mocks pointed at modules that are gone.
const mockOffice = {
  id: "1",
  name: "Berlin Office",
  description: "Main DE office",
  country: "Germany",
  city: "Berlin",
} as Office;

const renderModal = (props?: Partial<ComponentProps<typeof DeleteOfficeModal>>) => {
  const defaultProps: ComponentProps<typeof DeleteOfficeModal> = {
    isOpen: true,
    isLoading: false,
    office: mockOffice,
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };

  return {
    ...render(<DeleteOfficeModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("DeleteOfficeModal", () => {
  afterEach(() => jest.clearAllMocks());

  it("does not render when closed", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /permanently delete/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the office name in the title and explains the consequence", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /permanently delete "berlin office" office\?/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this office will be permanently removed from the system/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it("warns how many people lose the assignment when the office has any", () => {
    renderModal({ office: { ...mockOffice, assignedUsersCount: 3 } as Office });

    expect(screen.getByText(/3 people currently assigned/i)).toBeInTheDocument();
  });

  it("calls confirm action", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
  });

  it("calls request close action", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).toHaveBeenCalledTimes(1);
  });

  it("ignores both actions while loading", () => {
    const onConfirmAction = jest.fn();
    const onRequestCloseAction = jest.fn();

    renderModal({ isLoading: true, onConfirmAction, onRequestCloseAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(onConfirmAction).not.toHaveBeenCalled();
    expect(onRequestCloseAction).not.toHaveBeenCalled();
  });
});
