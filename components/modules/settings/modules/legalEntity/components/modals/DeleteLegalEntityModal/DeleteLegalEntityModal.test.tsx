import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteLegalEntityModal } from "./DeleteLegalEntityModal";
import { LegalEntity } from "@/models/legalEntity";

const mockEntity = {
  id: "le1",
  name: "Acme Ltd",
} as LegalEntity;

const renderModal = (
  props?: Partial<ComponentProps<typeof DeleteLegalEntityModal>>,
) => {
  const defaultProps: ComponentProps<typeof DeleteLegalEntityModal> = {
    isOpen: true,
    isLoading: false,
    entity: mockEntity,
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };

  return {
    ...render(<DeleteLegalEntityModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("DeleteLegalEntityModal", () => {
  afterEach(() => jest.clearAllMocks());

  it("does not render when closed", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /delete legal entity/i }),
    ).not.toBeInTheDocument();
  });

  it("renders content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /delete legal entity/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Acme Ltd")).toBeInTheDocument();

    expect(
      screen.getByText(/this legal entity will be permanently removed/i),
    ).toBeInTheDocument();
  });

  it("calls confirm action", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /delete legal entity/i }));

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
      screen.getByRole("button", { name: /delete legal entity/i }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete legal entity/i }));

    expect(onConfirmAction).not.toHaveBeenCalled();
    expect(onRequestCloseAction).not.toHaveBeenCalled();
  });
});
