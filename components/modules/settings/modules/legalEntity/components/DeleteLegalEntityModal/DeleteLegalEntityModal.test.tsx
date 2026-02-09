import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteLegalEntityModal } from "./DeleteLegalEntityModal";
import { LegalEntity } from "@/models/legalEntity";

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

const mockEntity: LegalEntity = {
  id: "1",
  name: "ACME GmbH",
  country: "Germany",
  isSystem: false,
  city: "Berlin",
  street: "Unter den Linden 10",
  building: "10",
  postCode: "10117",
  registrationNumber: "HRB 123456",
  taxId: "DE123456789",
};

describe("DeleteLegalEntityModal", () => {
  it("renders title with legal entity name and content text", () => {
    render(
      <DeleteLegalEntityModal
        isOpen
        entity={mockEntity}
        isLoading={false}
        onConfirm={jest.fn()}
        onRequestClose={jest.fn()}
      />
    );

    expect(
      screen.getByText(
        'Permanently delete "ACME GmbH" legal entity?'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This legal entity will be permanently removed from the system."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("This action cannot be undone.")
    ).toBeInTheDocument();
  });

  it("calls onRequestClose when Cancel is clicked and not loading", () => {
    const onRequestClose = jest.fn();

    render(
      <DeleteLegalEntityModal
        isOpen
        entity={mockEntity}
        isLoading={false}
        onConfirm={jest.fn()}
        onRequestClose={onRequestClose}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Delete is clicked and not loading", () => {
    const onConfirm = jest.fn();

    render(
      <DeleteLegalEntityModal
        isOpen
        entity={mockEntity}
        isLoading={false}
        onConfirm={onConfirm}
        onRequestClose={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("Delete"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("does not call onConfirm or onRequestClose when loading", () => {
    const onConfirm = jest.fn();
    const onRequestClose = jest.fn();

    render(
      <DeleteLegalEntityModal
        isOpen
        entity={mockEntity}
        isLoading={true}
        onConfirm={onConfirm}
        onRequestClose={onRequestClose}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));
    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(screen.getByText("outer-close"));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
