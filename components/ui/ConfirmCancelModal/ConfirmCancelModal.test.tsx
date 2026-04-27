import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmCancelModal } from "./ConfirmCancelModal";

const renderModal = (
  props?: Partial<ComponentProps<typeof ConfirmCancelModal>>,
) => {
  const defaultProps: ComponentProps<typeof ConfirmCancelModal> = {
    isOpen: true,
    onCancelAction: jest.fn(),
    onConfirmAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<ConfirmCancelModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("ConfirmCancelModal", () => {
  it("renders default content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /discard changes/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/you have unsaved changes/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /keep editing/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /discard/i }),
    ).toBeInTheDocument();
  });

  it("renders custom content", () => {
    renderModal({
      title: "Close form?",
      description: "Your changes will be lost.",
      cancelText: "Stay",
      confirmText: "Close",
    });

    expect(
      screen.getByRole("heading", { name: /close form/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/your changes will be lost/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /stay/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("calls cancel action", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("calls confirm action", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /discard/i }));

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
  });

  it("does not render content when closed", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });
});
