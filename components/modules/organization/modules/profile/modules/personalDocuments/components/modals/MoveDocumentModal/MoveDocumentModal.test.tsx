import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { MoveDocumentModal } from "./MoveDocumentModal";

const mockMoveDocumentForm = jest.fn();

let mockedFormSubmission = {
  folderId: "folder-2",
};

jest.mock("../MoveDocumentForm/MoveDocumentForm", () => ({
  MoveDocumentForm: (props: any) => {
    mockMoveDocumentForm(props);

    return (
      <div>
        <input aria-label="Destination folder" disabled={props.isLoading}/>

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
          Move
        </button>
      </div>
    );
  },
}));

const folders = [
  {
    id: "folder-1",
    name: "Contracts",
  },
  {
    id: "folder-2",
    name: "Payslips",
  },
];

const renderModal = (
  props?: Partial<ComponentProps<typeof MoveDocumentModal>>,
) => {
  const defaultProps: ComponentProps<typeof MoveDocumentModal> = {
    isOpen: true,
    isLoading: false,
    documentName: "Contract.pdf",
    folders,
    currentFolderId: "folder-1",
    onCancelAction: jest.fn(),
    onConfirmAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<MoveDocumentModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("MoveDocumentModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      folderId: "folder-2",
    };
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /move document/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/contract\.pdf/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/destination folder/i)).toBeInTheDocument();
  });

  it("passes props to form", () => {
    renderModal({ isLoading: true });

    expect(mockMoveDocumentForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        folders,
        currentFolderId: "folder-1",
      }),
    );

    expect(screen.getByLabelText(/destination folder/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^move$/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /^move$/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      folderId: "folder-2",
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
