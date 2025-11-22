import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteAttributeModal } from "./DeleteAttributeModal";
import { Attribute } from "@/models/attribute/Attribute";

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
  type: "TEXT",
  sortOrder: 1,
  decScale: null,
  dateHideYear: null,
  system: false,
  unique: false,
};

describe("DeleteAttributeModal", () => {
  it("does not render when isOpen is false", () => {
    render(
      <DeleteAttributeModal
        isOpen={false}
        isLoading={false}
        onConfirm={jest.fn()}
        onRequestClose={jest.fn()}
        attribute={mockAttribute}
      />
    );

    expect(
      screen.queryByText(/Permanently delete/i)
    ).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(
      <DeleteAttributeModal
        isOpen={true}
        isLoading={false}
        onConfirm={jest.fn()}
        onRequestClose={jest.fn()}
        attribute={mockAttribute}
      />
    );

    expect(
      screen.getByText(/Permanently delete Test Attribute attribute/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This attribute will be permanently deleted/i)
    ).toBeInTheDocument();
  });

  it("calls onConfirm when Delete is clicked", () => {
    const onConfirm = jest.fn();

    render(
      <DeleteAttributeModal
        isOpen={true}
        isLoading={false}
        onConfirm={onConfirm}
        onRequestClose={jest.fn()}
        attribute={mockAttribute}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onRequestClose when Cancel is clicked", () => {
    const onRequestClose = jest.fn();

    render(
      <DeleteAttributeModal
        isOpen={true}
        isLoading={false}
        onConfirm={jest.fn()}
        onRequestClose={onRequestClose}
        attribute={mockAttribute}
      />
    );

    fireEvent.click(screen.getByText(/Cancel/i));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
