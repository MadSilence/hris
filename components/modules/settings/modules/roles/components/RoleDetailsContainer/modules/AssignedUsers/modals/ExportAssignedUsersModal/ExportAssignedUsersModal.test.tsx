import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { ExportAssignedUsersModal } from "./ExportAssignedUsersModal";

const mockExportAssignedUsersForm = jest.fn();

let mockedFormSubmission = {
  format: "xlsx",
};

jest.mock("../ExportAssignedUsersForm/ExportAssignedUsersForm", () => ({
  ExportAssignedUsersForm: (props: any) => {
    mockExportAssignedUsersForm(props);

    return (
      <div>
        <input aria-label="Export format" disabled={props.isLoading}/>

        <button
          type="button"
          disabled={props.isLoading}
          onClick={props.onCancelAction}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={props.isLoading}
          onClick={() => props.onSubmitAction(mockedFormSubmission)}
        >
          Export
        </button>
      </div>
    );
  },
}));

const renderModal = (
  props?: Partial<ComponentProps<typeof ExportAssignedUsersModal>>,
) => {
  const defaultProps: ComponentProps<typeof ExportAssignedUsersModal> = {
    isOpen: true,
    isLoading: false,
    roleName: "Admin",
    onCancelAction: jest.fn(),
    onConfirmAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<ExportAssignedUsersModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("ExportAssignedUsersModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      format: "xlsx",
    };
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /export assigned users/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/export users assigned to/i)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/export format/i)).toBeInTheDocument();
  });

  it("passes loading state to form", () => {
    renderModal({ isLoading: true });

    expect(mockExportAssignedUsersForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      }),
    );

    expect(screen.getByLabelText(/export format/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /export/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /export/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      format: "xlsx",
    });
  });

  it("closes by Cancel", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("does not close while loading", () => {
    const onCancelAction = jest.fn();

    renderModal({
      isLoading: true,
      onCancelAction,
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).not.toHaveBeenCalled();
  });
});
