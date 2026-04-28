import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { ExportRolesModal } from "./ExportRolesModal";

const mockExportRolesForm = jest.fn();

let mockedFormSubmission = {
  format: "xlsx",
};

jest.mock("../ExportRolesForm/ExportRolesForm", () => ({
  ExportRolesForm: (props: any) => {
    mockExportRolesForm(props);

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

const renderModal = (props?: Partial<ComponentProps<typeof ExportRolesModal>>) => {
  const defaultProps: ComponentProps<typeof ExportRolesModal> = {
    isOpen: true,
    isLoading: false,
    onCancelAction: jest.fn(),
    onConfirmAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<ExportRolesModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("ExportRolesModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      format: "xlsx",
    };
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /export roles/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/export all roles with permissions and assigned users/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/export format/i)).toBeInTheDocument();
  });

  it("passes loading state to form", () => {
    renderModal({ isLoading: true });

    expect(mockExportRolesForm).toHaveBeenCalledWith(
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
