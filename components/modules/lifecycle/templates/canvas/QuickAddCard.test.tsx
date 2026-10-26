import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { QuickAddCard } from "./QuickAddCard";

jest.mock("@/public/desact/src/components/ui/select", () => jest.requireActual("@/test/selectMock"));

describe("QuickAddCard", () => {
  const setup = () => {
    const onAdd = jest.fn();
    const onCancel = jest.fn();
    render(<QuickAddCard left={10} top={20} where="Onboarding Manager · Day 1" onAddAction={onAdd} onCancelAction={onCancel} />);
    return { onAdd, onCancel };
  };

  it("adds a task with a title and a kind, from Enter in the title", () => {
    const { onAdd } = setup();
    expect(screen.getByText("Onboarding Manager · Day 1")).toBeInTheDocument();
    const title = screen.getByLabelText(/Title/);
    expect(title).toHaveFocus();
    fireEvent.change(title, { target: { value: "  Order a laptop " } });
    fireEvent.change(screen.getByLabelText("Kind"), { target: { value: "DOCUMENT" } });
    fireEvent.submit(title.closest("form") as HTMLFormElement);
    expect(onAdd).toHaveBeenCalledWith({ title: "Order a laptop", kind: "DOCUMENT" });
  });

  it("asks for a title next to the field rather than adding an untitled task", () => {
    const { onAdd } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
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
