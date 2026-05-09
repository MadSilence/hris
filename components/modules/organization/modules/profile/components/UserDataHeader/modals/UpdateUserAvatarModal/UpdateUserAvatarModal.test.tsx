import { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { UpdateUserAvatarModal } from "./UpdateUserAvatarModal";

const createObjectURLMock = jest.fn(() => "blob:avatar-preview");
const revokeObjectURLMock = jest.fn();

Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: createObjectURLMock,
});

Object.defineProperty(URL, "revokeObjectURL", {
  writable: true,
  value: revokeObjectURLMock,
});

const renderModal = (
  props?: Partial<ComponentProps<typeof UpdateUserAvatarModal>>,
) => {
  const defaultProps: ComponentProps<typeof UpdateUserAvatarModal> = {
    isOpen: true,
    isLoading: false,
    fullName: "John Smith",
    avatarUrl: "https://example.com/avatar.png",
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<UpdateUserAvatarModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("UpdateUserAvatarModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    createObjectURLMock.mockReturnValue("blob:avatar-preview");
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /profile picture/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/upload a new avatar or remove the current profile picture/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/current avatar/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /replace photo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove photo/i })).toBeInTheDocument();
  });

  it("renders initials fallback when avatarUrl is not provided", () => {
    renderModal({ avatarUrl: null });

    expect(screen.getByText("JS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload photo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove photo/i })).toBeDisabled();
  });

  it("keeps save button disabled before file selection", () => {
    renderModal();

    expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled();
  });

  it("selects file, shows file info and enables save", () => {
    renderModal();

    const file = new File(["avatar"], "very-long-avatar-file-name.png", {
      type: "image/png",
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(createObjectURLMock).toHaveBeenCalledWith(file);
    expect(screen.getByText("New avatar")).toBeInTheDocument();
    expect(screen.getByText(/very-long-a/i)).toBeInTheDocument();
    expect(screen.getByText(/kb/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /save changes/i })).toBeEnabled();
  });

  it("clears selected file", () => {
    renderModal();

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /clear selected image/i }));

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:avatar-preview");
    expect(screen.queryByText("avatar.png")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled();
  });

  it("calls onConfirmAction with upload submission", async () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(onConfirmAction).toHaveBeenCalledWith({
        action: "upload",
        file,
      });
    });
  });

  it("opens delete confirm modal and calls remove action", async () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /remove photo/i }));

    expect(
      screen.getByRole("heading", { name: /remove avatar/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove avatar/i }));

    await waitFor(() => {
      expect(onConfirmAction).toHaveBeenCalledWith({
        action: "remove",
      });
    });
  });

  it("calls onRequestCloseAction on cancel", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).toHaveBeenCalledTimes(1);
  });

  it("does not close or submit while loading", () => {
    const onRequestCloseAction = jest.fn();
    const onConfirmAction = jest.fn();

    renderModal({
      isLoading: true,
      onRequestCloseAction,
      onConfirmAction,
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).not.toHaveBeenCalled();
    expect(onConfirmAction).not.toHaveBeenCalled();

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /replace photo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /remove photo/i })).toBeDisabled();
  });
});
