import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AddTemplateDialog } from "./AddTemplateDialog";

jest.mock("@/components/modules/lifecycle/actions/lifecycleActions");

const renderDialog = () => {
  const onClose = jest.fn();
  render(<AddTemplateDialog open type="ONBOARDING" onCloseAction={onClose} onAddedAction={jest.fn()} />);
  return { onClose };
};

describe("AddTemplateDialog", () => {
  it("closes on Escape at once while nothing is typed", () => {
    const { onClose } = renderDialog();
    fireEvent.keyDown(screen.getByLabelText(/Name/), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("asks before Escape throws away a typed name, and stays open on Keep editing", async () => {
    const { onClose } = renderDialog();
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Engineers" } });
    fireEvent.keyDown(screen.getByLabelText(/Name/), { key: "Escape" });

    expect(await screen.findByText("Discard changes?")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Name/)).toHaveValue("Engineers");
  });

  it("closes once the discard is confirmed", async () => {
    const { onClose } = renderDialog();
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Engineers" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    fireEvent.click(await screen.findByRole("button", { name: "Discard" }));
    expect(onClose).toHaveBeenCalled();
  });
});
