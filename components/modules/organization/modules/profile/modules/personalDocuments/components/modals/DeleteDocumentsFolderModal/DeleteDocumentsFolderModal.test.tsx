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

  it("says the folder is empty when it is", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /delete folder/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Contracts")).toBeInTheDocument();
    expect(screen.getByText(/is empty/i)).toBeInTheDocument();
    // Nothing to decide about, so no choice is offered.
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("names what is inside and offers the choice", () => {
    // A non-empty folder used to be refused with "empty it first". The deletion policy asks for a
    // strategy instead, with the counts the server reported when the dialog opened.
    renderModal({
      impact: { name: "Contracts", documents: 3, subfolders: 1 },
    });

    expect(screen.getByText(/3 documents and 1 folder/i)).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("defaults to keeping the contents", () => {
    // Unassigning into nowhere is more often data loss than intent, so the safe branch is preselected.
    const onConfirmAction = jest.fn();
    renderModal({
      impact: { name: "Contracts", documents: 2, subfolders: 0 },
      onConfirmAction,
    });

    fireEvent.click(screen.getByRole("button", { name: /delete folder/i }));

    expect(onConfirmAction).toHaveBeenCalledWith("MOVE_TO_PARENT");
  });

  it("passes the chosen strategy on", () => {
    const onConfirmAction = jest.fn();
    renderModal({
      impact: { name: "Contracts", documents: 2, subfolders: 0 },
      onConfirmAction,
    });

    fireEvent.click(screen.getByRole("radio", { name: /delete the contents too/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete folder/i }));

    expect(onConfirmAction).toHaveBeenCalledWith("TRASH_CONTENTS");
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
