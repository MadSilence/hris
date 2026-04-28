import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { RenameDocumentsFolderModal } from "./RenameDocumentsFolderModal";

const mockRenameDocumentsFolderForm = jest.fn();

let mockedFormSubmission = {
  name: "Contracts Updated",
};

jest.mock("../RenameDocumentsFolderForm/RenameDocumentsFolderForm", () => ({
  RenameDocumentsFolderForm: (props: any) => {
    mockRenameDocumentsFolderForm(props);

    return (
      <div>
        <input aria-label="Folder name" disabled={props.isLoading}/>

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
          Save
        </button>
      </div>
    );
  },
}));

const renderModal = (
  props?: Partial<ComponentProps<typeof RenameDocumentsFolderModal>>,
) => {
  const defaultProps: ComponentProps<typeof RenameDocumentsFolderModal> = {
    isOpen: true,
    isLoading: false,
    folderName: "Contracts",
    onCancelAction: jest.fn(),
    onConfirmAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<RenameDocumentsFolderModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("RenameDocumentsFolderModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      name: "Contracts Updated",
    };
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /rename folder/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/update the folder name/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/folder name/i)).toBeInTheDocument();
  });

  it("passes props to form", () => {
    renderModal({ isLoading: true });

    expect(mockRenameDocumentsFolderForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        folderName: "Contracts",
      }),
    );

    expect(screen.getByLabelText(/folder name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      name: "Contracts Updated",
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
