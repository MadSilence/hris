import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { parseTokens, readEditable, serializeTokens, tokenNames, tokensAsWords } from "./tokens";
import { TokenTextField } from "./TokenTextField";

describe("tokens", () => {
  it("parses {name} into tokens and writes the same text back", () => {
    const text = "Hi {firstName}, you start on {startDate}. {not a token}";
    const pieces = parseTokens(text);
    expect(pieces).toEqual([
      { kind: "text", text: "Hi " },
      { kind: "token", name: "firstName" },
      { kind: "text", text: ", you start on " },
      { kind: "token", name: "startDate" },
      { kind: "text", text: ". {not a token}" },
    ]);
    expect(serializeTokens(pieces)).toBe(text);
    expect(tokenNames("{a}{b}{a}")).toEqual(["a", "b"]);
    expect(tokensAsWords("Book {firstName}", (n) => `<${n}>`)).toBe("Book <firstName>");
  });

  it("reads the field's DOM as stored text: a chip is {name}, a line break is a new line", () => {
    const root = document.createElement("div");
    root.innerHTML = 'Hi <span data-token="firstName" contenteditable="false">First name</span>,<div>see you</div><br>';
    expect(readEditable(root)).toBe("Hi {firstName},\nsee you\n");
  });
});

describe("TokenTextField", () => {
  const Harness: React.FC<{ initial: string; onChange: (v: string) => void; multiline?: boolean }> = ({ initial, onChange, multiline }) => {
    const [value, setValue] = React.useState(initial);
    return (
      <TokenTextField
        aria-label="Message"
        multiline={multiline}
        insertButton
        value={value}
        placeholders={["firstName", "leaveStart"]}
        onChange={(v) => {
          setValue(v);
          onChange(v);
        }}
      />
    );
  };

  const caretAfter = (node: Node) => {
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  it("draws each {name} as a chip and keeps {name} when text is typed around it", () => {
    const onChange = jest.fn();
    render(<Harness initial="Hi {firstName}" onChange={onChange} />);
    const field = screen.getByRole("textbox", { name: "Message" });
    const chip = field.querySelector('[data-token="firstName"]');
    expect(chip).toHaveTextContent("First name");
    field.appendChild(document.createTextNode("!"));
    fireEvent.input(field);
    expect(onChange).toHaveBeenLastCalledWith("Hi {firstName}!");
  });

  it("Backspace right after a chip removes the whole token", () => {
    const onChange = jest.fn();
    render(<Harness initial="Hi {firstName}" onChange={onChange} />);
    const field = screen.getByRole("textbox", { name: "Message" });
    const chip = field.querySelector('[data-token="firstName"]') as Node;
    caretAfter(chip);
    fireEvent.keyDown(field, { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith("Hi ");
    expect(field.querySelector("[data-token]")).toBeNull();
  });

  it("Insert a field adds the pick as a token at the end", () => {
    const onChange = jest.fn();
    render(<Harness initial="Off from " onChange={onChange} multiline />);
    fireEvent.click(screen.getByRole("button", { name: "Insert a field" }));
    fireEvent.click(screen.getByRole("option", { name: "First day off" }));
    expect(onChange).toHaveBeenLastCalledWith("Off from {leaveStart}");
  });

  it("\"@\" after a space: the token takes the \"@\"'s place and the space stays before it", () => {
    // Walk of 2026-11-07: "Hi @" + First name read "Hi" + chip + " " — the live range had already moved back.
    const onChange = jest.fn();
    render(<Harness initial="" onChange={onChange} />);
    const field = screen.getByRole("textbox", { name: "Message" });
    const text = document.createTextNode("Hi @");
    field.appendChild(text);
    const range = document.createRange();
    range.setStart(text, 4);
    range.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    fireEvent.input(field);
    fireEvent.click(screen.getByRole("option", { name: "First name" }));
    expect(onChange).toHaveBeenLastCalledWith("Hi {firstName}");
  });

  it("one line: Enter adds no line", () => {
    const onChange = jest.fn();
    render(<Harness initial="Subject" onChange={onChange} />);
    const field = screen.getByRole("textbox", { name: "Message" });
    const event = fireEvent.keyDown(field, { key: "Enter" });
    expect(event).toBe(false);
  });
});
