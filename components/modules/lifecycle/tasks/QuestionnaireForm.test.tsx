import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QuestionnaireForm } from "./QuestionnaireForm";
import type { Question } from "@/models/lifecycle";

jest.mock("@/components/ui/DatePicker", () => ({ DatePicker: () => null }));

const questions: Question[] = [
  { id: "q1", label: "How was the first week?", type: "SHORT_TEXT", required: true },
  { id: "q2", label: "Which tools?", type: "MULTIPLE_CHOICE", options: ["Slack", "Jira"], required: false },
];

describe("QuestionnaireForm", () => {
  it("does not send with a required question empty, and says which", async () => {
    const submit = jest.fn();
    render(<QuestionnaireForm taskId="t1" questions={questions} onSubmit={submit} />);
    fireEvent.click(screen.getByRole("button", { name: "Send answers" }));
    expect(await screen.findByText(/How was the first week\?/, { selector: "[role=alert], p, div" })).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("sends the answers by question id", async () => {
    const submit = jest.fn().mockResolvedValue(null);
    render(<QuestionnaireForm taskId="t1" questions={questions} onSubmit={submit} />);
    fireEvent.change(screen.getByLabelText(/How was the first week/), { target: { value: "Good" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Jira" }));
    fireEvent.click(screen.getByRole("button", { name: "Send answers" }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ q1: "Good", q2: ["Jira"] }));
  });
});
