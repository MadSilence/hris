import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AddTaskDialog } from "./AddTaskDialog";

jest.mock("@/components/modules/signing/hooks/useDocumentsSection", () => ({
  useDocumentTemplates: () => ({
    isLoading: false,
    data: [{
      id: "tpl-1", name: "Employment contract", isActive: true, envelopeExpiryDays: 30, problems: [],
      signers: [{ key: "employee", kind: "PERSON", order: 1 }, { key: "manager", kind: "MANAGER", order: 2 }],
    }],
  }),
}));
jest.mock("@/components/ui/SearchableSelect", () => jest.requireActual("@/test/searchableSelectMock"));

describe("AddTaskDialog", () => {
  const setup = () => {
    const onAdd = jest.fn();
    const onCancel = jest.fn();
    render(<AddTaskDialog open where="Onboarding manager · Day 1" onAddAction={onAdd} onCancelAction={onCancel} />);
    return { onAdd, onCancel };
  };

  it("adds a task with a title and a kind chosen from the listed kinds", () => {
    const { onAdd } = setup();
    expect(screen.getByText("Onboarding manager · Day 1")).toBeInTheDocument();
    // Every kind is laid out with what it asks for, not hidden in a dropdown.
    expect(screen.getAllByRole("radio")).toHaveLength(6);
    expect(screen.getByText(/Questions to answer/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "  Order a laptop " } });
    fireEvent.click(screen.getByRole("radio", { name: /Upload document/ }));
    expect(screen.getByRole("radio", { name: /Upload document/ })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(onAdd).toHaveBeenCalledWith({ title: "Order a laptop", kind: "DOCUMENT" });
  });

  it("asks for a title next to the field rather than adding an untitled task", () => {
    const { onAdd } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a title.");
  });

  it("closes on Escape and on Cancel", () => {
    const { onCancel } = setup();
    fireEvent.keyDown(screen.getByLabelText(/Title/), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("Sign: a document picked, the title taken from it; none picked is asked for next to the field", () => {
    const { onAdd } = setup();
    fireEvent.click(screen.getByRole("radio", { name: /^Sign/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText("Pick a document", { selector: "p" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Document/), { target: { value: "tpl-1" } });
    expect(screen.getAllByText("Signs: The person → Their manager").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(onAdd).toHaveBeenCalledWith({ title: "Sign: Employment contract", kind: "SIGN", templateId: "tpl-1" });
  });
});
