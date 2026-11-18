import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/desact/dialog";
import { InlineRename, isEditingInline, splitExtension } from "./InlineRename";

describe("InlineRename", () => {
  it("keeps the extension outside the field", () => {
    expect(splitExtension("contract.pdf")).toEqual(["contract", ".pdf"]);
    expect(splitExtension(".env")).toEqual([".env", ""]);
    expect(splitExtension("notes")).toEqual(["notes", ""]);
  });

  it("one click makes a field; Enter saves the name with its extension", async () => {
    const onRename = jest.fn().mockResolvedValue(true);
    render(<InlineRename name="contract.pdf" onRename={onRename} />);
    fireEvent.click(screen.getByRole("button", { name: "contract.pdf" }));
    const field = screen.getByRole("textbox");
    expect(field).toHaveValue("contract");
    expect(screen.getByText(".pdf")).toBeInTheDocument();
    fireEvent.change(field, { target: { value: "Employment contract" } });
    fireEvent.keyDown(field, { key: "Enter" });
    await waitFor(() => expect(onRename).toHaveBeenCalledWith("Employment contract.pdf"));
  });

  it("Escape cancels without saving; without a handler the name is plain text", () => {
    const onRename = jest.fn();
    const { rerender } = render(<InlineRename name="a.pdf" onRename={onRename} />);
    fireEvent.click(screen.getByRole("button", { name: "a.pdf" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "b" } });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "a.pdf" })).toBeInTheDocument();
    rerender(<InlineRename name="a.pdf" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("inside a dialog, Escape cancels the rename and leaves the dialog open (walk of 2026-11-18)", () => {
    const onOpenChange = jest.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent onEscapeKeyDown={(e) => { if (isEditingInline()) e.preventDefault(); }}>
          <DialogTitle>
            <InlineRename name="a.pdf" onRename={jest.fn()} />
          </DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: "a.pdf" }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "a.pdf" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("button", { name: "a.pdf" }), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
