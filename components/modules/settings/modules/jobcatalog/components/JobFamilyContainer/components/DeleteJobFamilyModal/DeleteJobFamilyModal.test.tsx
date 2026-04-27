import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteJobFamilyModal } from "./DeleteJobFamilyModal";

const mockJobFamily = {
  id: "jf1",
  name: "Engineering",
  isSystem: false,
};

const renderModal = (
  props?: Partial<ComponentProps<typeof DeleteJobFamilyModal>>,
) => {
  const defaultProps: ComponentProps<
    typeof DeleteJobFamilyModal
  > = {
    isOpen: true,
    isLoading: false,
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
    jobFamily: mockJobFamily,
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<DeleteJobFamilyModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("DeleteJobFamilyModal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", {
        name: /delete job family/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders delete job family content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", {
        name: /delete job family/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Engineering"),
    ).toBeInTheDocument();

    expect(
      screen.getByText((content) =>
        content.includes("This action cannot be undone"),
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /all jobs assigned to this job family will also be deleted/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /any employee data or structures referencing these jobs may be lost/i,
      ),
    ).toBeInTheDocument();
  });

  it("calls confirm action when Delete job family is clicked", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(
      screen.getByRole("button", {
        name: /delete job family/i,
      }),
    );

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
  });

  it("calls request close action when Cancel is clicked", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.click(
      screen.getByRole("button", { name: /cancel/i }),
    );

    expect(onRequestCloseAction).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", () => {
    const onConfirmAction = jest.fn();
    const onRequestCloseAction = jest.fn();

    renderModal({
      isLoading: true,
      onConfirmAction,
      onRequestCloseAction,
    });

    expect(
      screen.getByRole("button", { name: /cancel/i }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: /delete job family/i,
      }),
    ).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: /cancel/i }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /delete job family/i,
      }),
    );

    expect(onConfirmAction).not.toHaveBeenCalled();
    expect(onRequestCloseAction).not.toHaveBeenCalled();
  });
});
