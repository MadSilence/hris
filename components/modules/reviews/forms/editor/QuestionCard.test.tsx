import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReviewQuestion } from "@/models/reviews";
import { QuestionCard } from "./QuestionCard";

const question: ReviewQuestion = {
  id: "q-1",
  type: "SHORT_TEXT",
  label: "What went well?",
  description: "Think of the whole period.",
  required: false,
};

const renderCard = (q: ReviewQuestion, readOnly = false) => {
  const onChange = jest.fn();
  render(
    <ol>
      <QuestionCard question={q} number={1} first last readOnly={readOnly} onChange={onChange}
        onOverallChange={jest.fn()} onMove={jest.fn()} onDuplicate={jest.fn()} onRemove={jest.fn()} />
    </ol>,
  );
  return { onChange };
};

describe("QuestionCard guidance", () => {
  it("removes the guidance it was given, and offers to add it again", () => {
    const { onChange } = renderCard(question);
    fireEvent.click(screen.getByRole("button", { name: "Remove guidance" }));

    expect(onChange).toHaveBeenCalledWith({ ...question, description: null });
    expect(screen.queryByLabelText("Guidance for the reviewer")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add guidance" })).toBeInTheDocument();
  });

  it("offers no removal on a form that cannot be changed", () => {
    renderCard(question, true);
    expect(screen.queryByRole("button", { name: "Remove guidance" })).not.toBeInTheDocument();
  });
});
