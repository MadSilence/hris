import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AiPromptField } from "./AiPromptField";
import { AutomationStatusBadge } from "./AutomationStatusBadge";
import { AUTOMATION_ICONS, defaultIconFor } from "./AutomationIcon";

describe("AutomationStatusBadge", () => {
  it.each([
    ["ACTIVE", "Active", "approved"],
    ["DRAFT", "Draft", "draft"],
    ["ARCHIVED", "Archived", "archived"],
    ["PAUSED", "Paused", "inactive"],
  ] as const)("%s reads %s in the %s tone (Q-7: Paused is inactive)", (status, word, tone) => {
    const { container } = render(<AutomationStatusBadge status={status} />);

    expect(screen.getByText(word)).toBeInTheDocument();
    expect(container.querySelector("[data-slot=status-badge]")).toHaveAttribute("data-status", tone);
  });
});

describe("AutomationIcon", () => {
  it("falls back to what the trigger is about", () => {
    expect(defaultIconFor({ type: "PERSON_HIRED" })).toBe("user-add");
    expect(defaultIconFor({ type: "EVENT", event: "TIME_OFF_REQUESTED" })).toBe("beach");
    expect(defaultIconFor({ type: "DATE_OFFSET", field: "DATE_OF_BIRTH" })).toBe("cake");
    expect(defaultIconFor(null)).toBe("flash");
    expect(Object.keys(AUTOMATION_ICONS)).toContain(defaultIconFor({ type: "SCHEDULE" }));
  });
});

describe("AiPromptField", () => {
  const Field: React.FC<{ onSubmit: (value: string) => void; busy?: boolean; error?: string | null }> = (props) => {
    const [value, setValue] = React.useState("");
    return <AiPromptField value={value} onChange={setValue} variant="dialog" {...props} />;
  };

  it("sends nothing until there is text, then sends it", () => {
    const onSubmit = jest.fn();
    render(<Field onSubmit={onSubmit} />);

    expect(screen.getByRole("button", { name: "Draft with AI" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Describe what should happen"), { target: { value: "  Tell HR  " } });
    fireEvent.click(screen.getByRole("button", { name: "Draft with AI" }));

    expect(onSubmit).toHaveBeenCalledWith("Tell HR");
  });

  it("sends on ⌘/Ctrl + Enter", () => {
    const onSubmit = jest.fn();
    render(<Field onSubmit={onSubmit} />);

    const field = screen.getByLabelText("Describe what should happen");
    fireEvent.change(field, { target: { value: "Tell HR" } });
    fireEvent.keyDown(field, { key: "Enter", ctrlKey: true });

    expect(onSubmit).toHaveBeenCalledWith("Tell HR");
  });

  it("is read only and says Drafting… while it sends, and shows an error under it", () => {
    render(<Field onSubmit={jest.fn()} busy error="We couldn't draft it. Your text is still here." />);

    expect(screen.getByLabelText("Describe what should happen")).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: /Drafting…/ })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't draft it. Your text is still here.");
  });
});
