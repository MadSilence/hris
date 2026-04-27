import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteAttributeModal } from "./DeleteAttributeModal";
import { Attribute } from "@/models/attribute/Attribute";
import { AttributeType } from "@/models/attribute";

const mockAttribute: Attribute = {
  id: "123",
  name: "Test Attribute",
  createdAt: "",
  updatedAt: "",
  createdBy: null,
  updatedBy: null,
  version: 1,
  companyId: "c1",
  groupId: "g1",
  type: AttributeType.TEXT,
  sortOrder: 1,
  decScale: null,
  dateHideYear: null,
  system: false,
  unique: false,
};

const renderModal = (
  props?: Partial<ComponentProps<typeof DeleteAttributeModal>>,
) => {
  const defaultProps: ComponentProps<typeof DeleteAttributeModal> = {
    isOpen: true,
    isLoading: false,
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
    attribute: mockAttribute,
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<DeleteAttributeModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("DeleteAttributeModal", () => {
  it("does not render when isOpen is false", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /delete attribute/i }),
    ).not.toBeInTheDocument();
  });

  it("renders delete attribute content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /delete attribute/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Test Attribute")).toBeInTheDocument();

    expect(
      screen.getByText((content) =>
        content.includes("This action cannot be undone"),
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/deleted attributes cannot be restored/i),
    ).toBeInTheDocument();
  });

  it("renders options warning for select-like attributes", () => {
    renderModal({
      attribute: {
        ...mockAttribute,
        type: AttributeType.SELECT,
      },
    });

    expect(
      screen.getByText(
        /all options associated with this attribute will also be deleted/i,
      ),
    ).toBeInTheDocument();
  });

  it("does not render options warning for text attribute", () => {
    renderModal({
      attribute: {
        ...mockAttribute,
        type: AttributeType.TEXT,
      },
    });

    expect(
      screen.queryByText(
        /all options associated with this attribute will also be deleted/i,
      ),
    ).not.toBeInTheDocument();
  });

  it("calls confirm action when Delete attribute is clicked", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(
      screen.getByRole("button", { name: /delete attribute/i }),
    );

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
  });

  it("calls request close action when Cancel is clicked", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

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

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /delete attribute/i }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /delete attribute/i }),
    );

    expect(onRequestCloseAction).not.toHaveBeenCalled();
    expect(onConfirmAction).not.toHaveBeenCalled();
  });
});
