import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteDocumentsFolderModal } from "./DeleteDocumentsFolderModal";

const renderModal = (
  props?: Partial<ComponentProps<typeof DeleteDocumentsFolderModal>>,
) => {
  const defaultProps: ComponentProps<typeof DeleteDocumentsFolderModal> = {
    isOpen: true,
    isLoading: false,
    folderName: "Contracts",
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };

  return {
    ...render(<DeleteDocumentsFolderModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("DeleteDocumentsFolderModal", () => {
  afterEach(() => jest.clearAllMocks());

  it("does not render when closed", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /delete folder/i }),
    ).not.toBeInTheDocument();
  });

  it("tells the user the folder must be emptied first", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /delete folder/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Contracts")).toBeInTheDocument();

    // The backend refuses to delete a non-empty folder, so the warning must not imply a cascade.
    expect(
      screen.getByText(/the folder has to be empty/i),
    ).toBeInTheDocument();
  });

  it("shows a failed delete inside the dialog", () => {
    renderModal({ errorMessage: "You cannot delete this folder." });

    expect(
      screen.getByText("You cannot delete this folder."),
    ).toBeInTheDocument();
  });

  it("calls confirm action", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /delete folder/i }));

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
  });

  it("calls request close action", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", () => {
    const onConfirmAction = jest.fn();
    const onRequestCloseAction = jest.fn();

    renderModal({ isLoading: true, onConfirmAction, onRequestCloseAction });

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /delete folder/i }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete folder/i }));

    expect(onConfirmAction).not.toHaveBeenCalled();
    expect(onRequestCloseAction).not.toHaveBeenCalled();
  });
});
