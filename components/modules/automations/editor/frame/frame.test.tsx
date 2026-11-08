import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/desact/tooltip";
import { headerButtons } from "../state/editorLogic";
import { StepMenu } from "../windows/StepSettingsWindow";
import { EditorHeader } from "./EditorHeader";
import { ToolBlock } from "./ToolBlock";

const header = (status: "DRAFT" | "ACTIVE" | "PAUSED", readMode = false) => {
  const onButton = jest.fn();
  render(
    <TooltipProvider>
      <EditorHeader
        name="Long time off approval"
        icon={null}
        trigger={{ type: "PERSON_HIRED" }}
        status={status}
        buttons={headerButtons({ status, readMode, canManage: true, system: false })}
        canRename={!readMode}
        onRename={jest.fn()}
        onClose={jest.fn()}
        onButton={onButton}
      />
    </TooltipProvider>,
  );
  return onButton;
};

const buttonNames = () =>
  screen
    .getAllByRole("button")
    .map((b) => b.textContent ?? "")
    .filter((text) => text.length > 0 && text !== "Long time off approval");

describe("EditorHeader", () => {
  it("shows Save draft and Turn on for a draft", () => {
    const onButton = header("DRAFT");
    expect(buttonNames()).toEqual(["Test run", "Save draft", "Turn on"]);
    fireEvent.click(screen.getByRole("button", { name: "Turn on" }));
    expect(onButton).toHaveBeenCalledWith("turnOn");
  });

  it("shows Turn off and Save changes on an active one, Turn on on a paused one", () => {
    header("ACTIVE");
    expect(buttonNames()).toEqual(["Test run", "Turn off", "Save changes"]);
  });

  it("shows Turn on and Save changes on a paused one", () => {
    header("PAUSED");
    expect(buttonNames()).toEqual(["Test run", "Turn on", "Save changes"]);
  });

  it("offers Edit in read mode, and the name is not a button there", () => {
    header("ACTIVE", true);
    expect(buttonNames()).toEqual(["Test run", "Edit"]);
    expect(screen.queryByRole("button", { name: "Rename Long time off approval" })).not.toBeInTheDocument();
  });
});

describe("ToolBlock", () => {
  it("hides noddo AI and Add a step in read mode, and toggles a tool", () => {
    const onToggle = jest.fn();
    const { rerender } = render(
      <TooltipProvider>
        <ToolBlock open="who" readOnly={false} onToggle={onToggle} />
      </TooltipProvider>,
    );
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      "noddo AI",
      "Add a step",
      "Who it runs for",
      "Run history",
      "Versions",
    ]);
    expect(screen.getByRole("button", { name: "Who it runs for" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Run history" }));
    expect(onToggle).toHaveBeenCalledWith("runs");

    rerender(
      <TooltipProvider>
        <ToolBlock open={null} readOnly onToggle={onToggle} />
      </TooltipProvider>,
    );
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual(["Who it runs for", "Run history", "Versions"]);
  });
});

describe("StepMenu (G4)", () => {
  const menu = (skipped = false) => {
    const props = {
      skipped,
      open: true,
      onOpenChange: jest.fn(),
      onDuplicate: jest.fn(),
      onToggleSkip: jest.fn(),
      onRemove: jest.fn(),
    };
    render(<StepMenu {...props} />);
    return props;
  };

  it("offers Duplicate, Skip for now and, past a separator, Remove step", () => {
    menu();
    expect(screen.getAllByRole("menuitem").map((i) => i.textContent)).toEqual(["Duplicate step", "Skip for now", "Remove step"]);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("removes without asking, and offers Don't skip on a skipped step", () => {
    const props = menu(true);
    expect(screen.getByRole("menuitem", { name: "Don't skip" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove step" }));
    expect(props.onRemove).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
