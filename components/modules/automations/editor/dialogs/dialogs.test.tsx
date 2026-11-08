import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { AutomationCheck } from "@/models/automations";
import { TurnOnDialog } from "./TurnOnDialog";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { RunsGoingDialog } from "./RunsGoingDialog";

const check = (over: Partial<AutomationCheck> = {}): AutomationCheck => ({
  matchingCount: 48,
  matching: [],
  places: ["Poland", "Lithuania"],
  waitingCases: 0,
  messagesPerFiring: 1,
  volumeThreshold: 200,
  audiences: ["Managers", "HR Admin"],
  runsGoing: 0,
  examples: [],
  problems: [],
  ...over,
});

const turnOn = (over: Partial<React.ComponentProps<typeof TurnOnDialog>> = {}) => {
  const props: React.ComponentProps<typeof TurnOnDialog> = {
    open: true,
    name: "Long time off approval",
    check: check(),
    everyone: false,
    requests: true,
    notConnected: [],
    turning: false,
    error: null,
    onCancel: jest.fn(),
    onTestFirst: jest.fn(),
    onConfirm: jest.fn(),
    ...over,
  };
  render(<TurnOnDialog {...props} />);
  return props;
};

describe("TurnOnDialog", () => {
  it("says who it runs for, what it starts with and who hears from it (F4)", () => {
    const props = turnOn();
    const dialog = screen.getByRole("dialog", { name: "Turn on Long time off approval?" });
    expect(within(dialog).getByText("It runs for 48 people in Poland and Lithuania.")).toBeInTheDocument();
    expect(within(dialog).getByText("It starts with new requests. Requests sent before today aren't affected.")).toBeInTheDocument();
    expect(within(dialog).getByText("Managers and HR Admin will get requests and notifications from it.")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Turn on" }));
    expect(props.onConfirm).toHaveBeenCalledWith("NONE", false);
    fireEvent.click(within(dialog).getByRole("button", { name: "Test run first" }));
    expect(props.onTestFirst).toHaveBeenCalled();
  });

  it("asks about the cases already waiting (V6), and holds Turn on until a big send is acknowledged", () => {
    const props = turnOn({ check: check({ waitingCases: 6, messagesPerFiring: 40 }) });
    expect(screen.getByText("Who should it run for?")).toBeInTheDocument();
    expect(screen.queryByText(/This sends/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /^Also the 6\srequests already waiting$/ }));
    expect(screen.getByText("240 messages")).toBeInTheDocument();
    const confirm = screen.getByRole("button", { name: "Turn on" });
    expect(confirm).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox"));
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    expect(props.onConfirm).toHaveBeenCalledWith("ALL", true);
  });

  it("names the steps a run will skip, and shows a refusal inside the dialog", () => {
    turnOn({ notConnected: ["Ask to sign the handbook"], error: "We couldn't turn it on. Try again.", everyone: true });
    expect(screen.getByText("It runs for everyone.")).toBeInTheDocument();
    expect(screen.getByText("1 step isn't connected yet, so runs skip it: Ask to sign the handbook.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't turn it on. Try again.");
  });
});

describe("UnsavedChangesDialog (H2)", () => {
  const h2 = () => {
    const props = { open: true, name: "Long time off approval", saving: false, onKeepEditing: jest.fn(), onSaveAndLeave: jest.fn() };
    render(<UnsavedChangesDialog {...props} />);
    return props;
  };

  it("asks to save before leaving, and saves and leaves", () => {
    const props = h2();
    expect(screen.getByText("You changed Long time off approval. Save the changes before you leave.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save and leave" }));
    expect(props.onSaveAndLeave).toHaveBeenCalled();
    expect(props.onKeepEditing).not.toHaveBeenCalled();
  });

  it("keeps editing on Esc and on ×, not only on its button", () => {
    const props = h2();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(props.onKeepEditing).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(props.onKeepEditing).toHaveBeenCalledTimes(3);
    expect(props.onSaveAndLeave).not.toHaveBeenCalled();
  });
});

describe("RunsGoingDialog (V7)", () => {
  it("keeps the runs going as they are by default, and moves them when asked", () => {
    const onSave = jest.fn();
    render(<RunsGoingDialog open name="Probation review" runsGoing={3} saving={false} error={null} onCancel={jest.fn()} onSave={onSave} />);
    expect(screen.getByText("3 runs are still going. What should happen to them?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSave).toHaveBeenLastCalledWith("KEEP");
    fireEvent.click(screen.getByRole("radio", { name: "Move them to the changes" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSave).toHaveBeenLastCalledWith("MOVE");
  });
});
