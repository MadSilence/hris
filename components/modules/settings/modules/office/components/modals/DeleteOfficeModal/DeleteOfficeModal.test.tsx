import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteOfficeModal } from "./DeleteOfficeModal";
import { Office } from "@/models/office";

jest.mock("@/components/ui/Modal/Modal", () => {
  return ({ title, footer, children, onRequestClose }: any) => (
    <div data-testid="modal">
      <h1>{title}</h1>
      <button onClick={onRequestClose}>outer-close</button>
      <div data-testid="modal-content">{children}</div>
      <div data-testid="modal-footer">{footer}</div>
    </div>
  );
});

jest.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

const mockOffice: Office = {
  id: "1",
  name: "Berlin Office",
  description: "Main DE office",
  email: "berlin@example.com",
  phone: "+49 30 123456",
  isSystem: false,
  country: "Germany",
  city: "Berlin",
  street: "Unter den Linden 10",
  building: "10",
  postCode: "10117",
};

describe("DeleteOfficeModal", () => {
  it("renders title with office name and content text", () => {
    render(
      <DeleteOfficeModal
        isOpen
        office={mockOffice}
        isLoading={false}
        onConfirm={jest.fn()}
        onRequestClose={jest.fn()}
      />,
    );

    expect(
      screen.getByText('Permanently delete "Berlin Office" office?'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This office will be permanently removed from the system.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("This action cannot be undone."),
    ).toBeInTheDocument();
  });

  it("calls onRequestClose when Cancel is clicked and not loading", () => {
    const onRequestClose = jest.fn();

    render(
      <DeleteOfficeModal
        isOpen
        office={mockOffice}
        isLoading={false}
        onConfirm={jest.fn()}
        onRequestClose={onRequestClose}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Delete is clicked and not loading", () => {
    const onConfirm = jest.fn();

    render(
      <DeleteOfficeModal
        isOpen
        office={mockOffice}
        isLoading={false}
        onConfirm={onConfirm}
        onRequestClose={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Delete"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("does not call onConfirm or onRequestClose when loading", () => {
    const onConfirm = jest.fn();
    const onRequestClose = jest.fn();

    render(
      <DeleteOfficeModal
        isOpen
        office={mockOffice}
        isLoading={true}
        onConfirm={onConfirm}
        onRequestClose={onRequestClose}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(screen.getByText("outer-close"));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
