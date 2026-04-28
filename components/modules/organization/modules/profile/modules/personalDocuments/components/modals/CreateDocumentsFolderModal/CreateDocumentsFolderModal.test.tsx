import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { CreateDocumentsFolderModal } from "./CreateDocumentsFolderModal";

const mockCreateDocumentsFolderForm = jest.fn();

let mockedFormSubmission = {
  name: "Contracts",
};

jest.mock("../CreateDocumentsFolderForm/CreateDocumentsFolderForm", () => ({
  CreateDocumentsFolderForm: (props: any) => {
    mockCreateDocumentsFolderForm(props);

    return (
      <div>
        <input
          aria-label="Folder name"
          onChange={() => props.onDirtyChangeAction?.(true)}
          disabled={props.isLoading}
        />

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
          Create
        </button>
      </div>
    );
  },
}));

const renderModal = (
  props?: Partial<ComponentProps<typeof CreateDocumentsFolderModal>>,
) => {
  const defaultProps: ComponentProps<typeof CreateDocumentsFolderModal> = {
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
    ...render(<CreateDocumentsFolderModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("CreateDocumentsFolderModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      name: "Contracts",
    };
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /create folder/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/create a new folder to organize personal documents/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/folder name/i)).toBeInTheDocument();
  });

  it("passes loading state to form", () => {
    renderModal({ isLoading: true });

    expect(mockCreateDocumentsFolderForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      }),
    );

    expect(screen.getByLabelText(/folder name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      name: "Contracts",
    });
  });

  it("closes by Cancel when form is not dirty", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("opens confirm cancel modal on Cancel when form is dirty", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/folder name/i), {
      target: { value: "Contracts" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /discard changes/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/you have unsaved changes/i)).toBeInTheDocument();
  });

  it("keeps modal open when confirm cancel is cancelled", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/folder name/i), {
      target: { value: "Contracts" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /create folder/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });

  it("closes modal when dirty close is confirmed", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/folder name/i), {
      target: { value: "Contracts" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /discard/i }));

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

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });
});
