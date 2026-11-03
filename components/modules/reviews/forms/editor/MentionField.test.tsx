import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MentionField } from "./MentionField";

function Harness({ initial = "", multiline = false }: { initial?: string; multiline?: boolean }) {
  const [value, setValue] = React.useState(initial);
  return <MentionField aria-label="Question" value={value} onChange={setValue} multiline={multiline} />;
}

const type = (el: HTMLElement, text: string) => {
  fireEvent.change(el, { target: { value: text, selectionStart: text.length, selectionEnd: text.length } });
};

describe("MentionField", () => {
  it("paints a background under each token and nothing under the rest", () => {
    const { container } = render(<Harness initial="How did @subject help @team in {subjectFirstName}?" />);
    const marks = container.querySelectorAll("[data-test='mention-mirror'] mark");
    expect(Array.from(marks).map((m) => m.textContent)).toEqual(["@subject", "{subjectFirstName}"]);
    expect(marks[0]).toHaveAttribute("data-token", "subject");
    // The mirror repeats the text exactly, so the backgrounds sit under the field's own letters.
    expect(container.querySelector("[data-test='mention-mirror']")?.textContent)
      .toBe("How did @subject help @team in {subjectFirstName}?");
  });

  it("offers the tokens after @ and inserts the one chosen with the keyboard", () => {
    render(<Harness />);
    const field = screen.getByRole("textbox", { name: "Question" });
    type(field, "How did @sub");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "@subjectFirst name of the person reviewed",
      "@subjectFullNameFull name of the person reviewed",
    ]);
    expect(field).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(field, { key: "ArrowDown" });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(field).toHaveValue("How did @subjectFullName ");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("inserts a token picked with the mouse, in a textarea too", () => {
    render(<Harness multiline />);
    const field = screen.getByRole("textbox", { name: "Question" });
    type(field, "Ask @ma");
    fireEvent.mouseDown(screen.getByRole("option", { name: /@manager/ }));
    expect(field).toHaveValue("Ask @manager ");
  });

  it("closes the list on Escape and offers nothing for an unknown word", () => {
    render(<Harness />);
    const field = screen.getByRole("textbox", { name: "Question" });
    type(field, "@");
    expect(screen.getAllByRole("option")).toHaveLength(4);
    fireEvent.keyDown(field, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    type(field, "@team");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
