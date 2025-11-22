import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteGroupModal } from "./DeleteGroupModal";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";

const mockGroup: AttributeGroup = {
  id: "g1",
  name: "HR",
  isSystem: false,
  sortOrder: 1,
  createdAt: "",
  createdBy: "",
  updatedAt: "",
  attributes: [],
};

type Props = React.ComponentProps<typeof DeleteGroupModal>;

const defaultProps: Props = {
  isOpen: true,
  isLoading: false,
  onConfirm: jest.fn(),
  onRequestClose: jest.fn(),
  group: mockGroup,
};

const renderComponent = (override?: Partial<Props>) => {
  const props: Props = { ...defaultProps, ...override };
  return {
    ...render(<DeleteGroupModal {...props} />),
    props,
  };
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("DeleteGroupModal", () => {
  it("does not render when isOpen = false", () => {
    renderComponent({ isOpen: false });
    expect(screen.queryByText(/Delete section/i)).not.toBeInTheDocument();
  });

  it("renders with group name and content when isOpen = true", () => {
    renderComponent({ isOpen: true });
    expect(screen.getByText(/Delete section HR\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/All attributes assigned to this section will also be deleted/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/All employee data you entered for these attributes will be lost/i)
    ).toBeInTheDocument();
  });

  it("calls onConfirm when Delete is clicked", () => {
    const onConfirm = jest.fn();
    renderComponent({ onConfirm });
    fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onRequestClose when Cancel is clicked", () => {
    const onRequestClose = jest.fn();
    renderComponent({ onRequestClose });
    fireEvent.click(screen.getByRole("button", { name: /^Cancel$/i }));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it("does not trigger actions when isLoading = true", () => {
    const onConfirm = jest.fn();
    const onRequestClose = jest.fn();
    renderComponent({ isLoading: true, onConfirm, onRequestClose });

    fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Cancel$/i }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
