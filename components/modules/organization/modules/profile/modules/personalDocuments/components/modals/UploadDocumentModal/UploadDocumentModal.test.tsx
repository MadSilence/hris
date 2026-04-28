import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { UploadDocumentModal } from "./UploadDocumentModal";

const mockUploadDocumentForm = jest.fn();

const file = new File(["content"], "contract.pdf", {
  type: "application/pdf",
});

let mockedFormSubmission = {
  file,
  folderId: "folder-2",
};

jest.mock("../UploadDocumentForm/UploadDocumentForm", () => ({
  UploadDocumentForm: (props: any) => {
    mockUploadDocumentForm(props);

    return (
      <div>
        <input aria-label="File" disabled={props.isLoading}/>

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
          Upload
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
  props?: Partial<ComponentProps<typeof UploadDocumentModal>>,
) => {
  const defaultProps: ComponentProps<typeof UploadDocumentModal> = {
    isOpen: true,
    isLoading: false,
    folders,
    defaultFolderId: "folder-1",
    onCancelAction: jest.fn(),
    onConfirmAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<UploadDocumentModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("UploadDocumentModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      file,
      folderId: "folder-2",
    };
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /add document/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/upload a document and place it into a folder/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/file/i)).toBeInTheDocument();
  });

  it("passes props to form", () => {
    renderModal({ isLoading: true });

    expect(mockUploadDocumentForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        folders,
        defaultFolderId: "folder-1",
      }),
    );

    expect(screen.getByLabelText(/file/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /upload/i })).toBeDisabled();
  });

  it("calls confirm action from form submit", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /upload/i }));

    expect(onConfirmAction).toHaveBeenCalledWith({
      file,
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
