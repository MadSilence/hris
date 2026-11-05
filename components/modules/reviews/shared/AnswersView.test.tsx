import * as React from "react";
import { render, screen } from "@testing-library/react";
import { translatorFor } from "@/test/nextIntl";
import type { AnswersBlock, CommonT, ScalePoint } from "@/models/reviews";
import { AnswersView, answerText } from "./AnswersView";

const scale: ScalePoint[] = [{ value: 1, label: "Low" }, { value: 2, label: "High" }];
const tCommon = translatorFor("common") as unknown as CommonT;
const mentions = { subject: "Ann", subjectFullName: "Ann Lee", manager: "Bea", cycle: "H2 Review" };

describe("AnswersView", () => {
  it("writes each answer type as text", () => {
    const a = (type: AnswersBlock["answers"][number]["type"], value: AnswersBlock["answers"][number]["value"]) =>
      answerText({ questionId: "q", label: "Q", type, value, comment: null }, scale, tCommon);
    expect(a("RATING", 2)).toBe("2 · High");
    expect(a("YES_NO", false)).toBe("No");
    expect(a("MULTIPLE_CHOICE", ["A", "B"])).toBe("A, B");
    expect(a("LONG_TEXT", "")).toBe("—");
  });

  it("shows an anonymous peer review with neither its author nor its date", () => {
    render(<AnswersView scale={scale} mentions={mentions} block={{
      assignmentId: "a1", kind: "PEER", author: null, submittedAt: null, previous: false,
      answers: [{ questionId: "q1", label: "Strengths", type: "LONG_TEXT", value: "Kind", comment: null }],
    }} />);
    expect(screen.getByRole("heading", { name: "Peer review" })).toBeInTheDocument();
    expect(screen.queryByText(/Submitted/)).not.toBeInTheDocument();
    expect(screen.getByText("Kind")).toBeInTheDocument();
  });

  it("replaces the mentions in a question, the old brace form included", () => {
    render(<AnswersView scale={scale} mentions={mentions} block={{
      assignmentId: "a3", kind: "SELF", author: null, submittedAt: null, previous: false,
      answers: [
        { questionId: "q1", label: "How did {subjectFirstName} do?", type: "LONG_TEXT", value: "Well", comment: null },
        { questionId: "q2", label: "Did @subjectFullName help @manager in @cycle?", type: "LONG_TEXT", value: "Yes", comment: null },
      ],
    }} />);
    expect(screen.getByText("How did Ann do?")).toBeInTheDocument();
    expect(screen.getByText("Did Ann Lee help Bea in H2 Review?")).toBeInTheDocument();
  });

  it("names the author of a review that is not anonymous, and a previous manager's", () => {
    render(<AnswersView scale={scale} mentions={mentions} block={{
      assignmentId: "a2", kind: "MANAGER", author: { userId: "u1", name: "Bea Boss" }, submittedAt: "2026-11-02T10:00:00",
      previous: true, answers: [],
    }} />);
    expect(screen.getByRole("heading", { name: "Manager review — Bea Boss" })).toBeInTheDocument();
    expect(screen.getByText("Written by a previous manager")).toBeInTheDocument();
  });
});
