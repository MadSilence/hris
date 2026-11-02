import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AddTaskDialog } from "./AddTaskDialog";

describe("AddTaskDialog", () => {
  const setup = () => {
    const onAdd = jest.fn();
    const onCancel = jest.fn();
    render(<AddTaskDialog open where="Onboarding Manager · Day 1" onAddAction={onAdd} onCancelAction={onCancel} />);
    return { onAdd, onCancel };
  };

  it("adds a task with a title and a kind chosen from the listed kinds", () => {
    const { onAdd } = setup();
    expect(screen.getByText("Onboarding Manager · Day 1")).toBeInTheDocument();
    // Every kind is laid out with what it asks for, not hidden in a dropdown.
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByText(/Questions to answer/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "  Order a laptop " } });
    fireEvent.click(screen.getByRole("radio", { name: /Upload Document/ }));
    expect(screen.getByRole("radio", { name: /Upload Document/ })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));
    expect(onAdd).toHaveBeenCalledWith({ title: "Order a laptop", kind: "DOCUMENT" });
  });

  it("asks for a title next to the field rather than adding an untitled task", () => {
    const { onAdd } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a title.");
  });

  it("closes on Escape and on Cancel", () => {
    const { onCancel } = setup();
    fireEvent.keyDown(screen.getByLabelText(/Title/), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
