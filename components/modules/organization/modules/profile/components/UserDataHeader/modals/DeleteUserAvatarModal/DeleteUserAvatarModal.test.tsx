import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { DeleteUserAvatarModal } from "./DeleteUserAvatarModal";

const renderModal = (
  props?: Partial<ComponentProps<typeof DeleteUserAvatarModal>>,
) => {
  const defaultProps: ComponentProps<typeof DeleteUserAvatarModal> = {
    isOpen: true,
    isLoading: false,
    fullName: "John Smith",
    onRequestCloseAction: jest.fn(),
    onConfirmAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<DeleteUserAvatarModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("DeleteUserAvatarModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal content with user full name", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /remove avatar/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("John Smith")).toBeInTheDocument();

    expect(
      screen.getByText(/the current avatar will be permanently removed/i),
    ).toBeInTheDocument();
  });

  it("renders fallback user text when fullName is not provided", () => {
    renderModal({ fullName: undefined });

    expect(screen.getByText("this user")).toBeInTheDocument();
  });

  it("calls onConfirmAction when remove avatar is clicked", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /remove avatar/i }));

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
  });

  it("disables buttons while loading", () => {
    renderModal({ isLoading: true });

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /remove avatar/i }),
    ).toBeDisabled();
  });
});
