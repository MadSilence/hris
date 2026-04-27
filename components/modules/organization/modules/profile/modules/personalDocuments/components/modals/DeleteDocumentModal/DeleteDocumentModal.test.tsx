import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteDocumentModal } from "./DeleteDocumentModal";

const renderModal = (
  props?: Partial<ComponentProps<typeof DeleteDocumentModal>>,
) => {
  const defaultProps: ComponentProps<typeof DeleteDocumentModal> = {
    isOpen: true,
    isLoading: false,
    documentName: "Contract.pdf",
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };

  return {
    ...render(<DeleteDocumentModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("DeleteDocumentModal", () => {
  afterEach(() => jest.clearAllMocks());

  it("does not render when closed", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /delete document/i }),
    ).not.toBeInTheDocument();
  });

  it("renders content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /delete document/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Contract.pdf")).toBeInTheDocument();

    expect(
      screen.getByText(/deleted files cannot be restored/i),
    ).toBeInTheDocument();
  });

  it("calls confirm action", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /delete document/i }));

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
      screen.getByRole("button", { name: /delete document/i }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete document/i }));

    expect(onConfirmAction).not.toHaveBeenCalled();
    expect(onRequestCloseAction).not.toHaveBeenCalled();
  });
});
