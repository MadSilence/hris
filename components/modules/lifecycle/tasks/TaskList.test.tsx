import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TaskList } from "./TaskList";
import type { Task } from "@/models/lifecycle";
import { ActionStatus } from "@/components/models/ActionStatus";
import { updateUserAttributesAction } from "@/components/modules/organization/modules/profile/actions/updateUserAttributesAction";
import { documentService } from "@/components/modules/organization/modules/profile/modules/personalDocuments/services/documentService";

jest.mock("@/components/modules/lifecycle/actions/lifecycleActions", () => ({
  addTaskCommentAction: jest.fn(),
  answerQuestionnaireAction: jest.fn(),
}));
jest.mock("@/components/modules/organization/modules/profile/actions/updateUserAttributesAction", () => ({
  updateUserAttributesAction: jest.fn(),
}));
jest.mock("@/components/modules/organization/modules/profile/modules/personalDocuments/services/documentService", () => ({
  documentService: { uploadPersonalDocument: jest.fn() },
}));
jest.mock("@/components/clients/apiClient", () => ({ internalApiClient: { get: jest.fn(), fetch: jest.fn() } }));
jest.mock("@/components/ui/DatePicker", () => ({ DatePicker: () => null }));
jest.mock("@/components/ui/SearchableSelect", () => ({ SearchableSelect: () => null }));

const task = (over: Partial<Task> = {}): Task => ({
  id: "t1",
  kind: "TODO",
  title: "Order a laptop",
  description: null,
  status: "OPEN",
  dueKind: "OFFSET",
  dueDate: "2026-11-10",
  dueReached: false,
  subject: { id: "p1", name: "Alan Turing" },
  assigneeKind: "ONBOARDING_MANAGER",
  assignee: { id: "m1", name: "Ada Lovelace" },
  processId: "proc1",
  processType: "ONBOARDING",
  fields: null,
  category: null,
  completedAt: null,
  waitingFor: [],
  materials: [],
  questions: null,
  commentCount: 0,
  ...over,
});

describe("TaskList — done where shown", () => {
  beforeEach(() => jest.clearAllMocks());

  it("ticks a to-do that requires a file only with the file, which goes to the person's Documents", async () => {
    const complete = jest.fn();
    (documentService.uploadPersonalDocument as jest.Mock).mockResolvedValue({ id: "doc1" });
    render(<TaskList tasks={[task({ category: { id: "cat1", name: "Handover" } })]} onCompleteAction={complete} />);

    expect(screen.queryByRole("button", { name: "Mark Done" })).not.toBeInTheDocument();
    const attach = screen.getByRole("button", { name: "Attach and Mark Done" });
    expect(attach).toBeDisabled();

    const file = new File(["x"], "handover.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("File"), { target: { files: [file] } });
    fireEvent.click(attach);

    await waitFor(() => expect(complete).toHaveBeenCalledWith(expect.objectContaining({ id: "t1" }), "doc1"));
    expect(documentService.uploadPersonalDocument).toHaveBeenCalledWith({ userId: "p1", file, categoryId: "cat1" });
  });

  it("lets only the assignee acknowledge", () => {
    const ack = task({ kind: "ACKNOWLEDGE", materials: [{ type: "LINK", url: "https://example.test/policy", name: "Policy" }] });
    const { rerender } = render(<TaskList tasks={[ack]} onCompleteAction={jest.fn()} isMine={() => false} />);
    expect(screen.queryByRole("button", { name: "I Have Read It" })).not.toBeInTheDocument();
    expect(screen.getByText(/Waiting for Ada Lovelace to confirm/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Policy/ })).toHaveAttribute("href", "https://example.test/policy");

    rerender(<TaskList tasks={[ack]} onCompleteAction={jest.fn()} isMine={() => true} />);
    expect(screen.getByRole("button", { name: "I Have Read It" })).toBeInTheDocument();
  });

  it("fills simple fields in the row, through the profile's own write", async () => {
    (updateUserAttributesAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS });
    const changed = jest.fn();
    render(<TaskList onChangedAction={changed} tasks={[task({
      kind: "FILL_FIELDS",
      fields: [{ id: "a1", name: "Emergency phone", type: "PHONE", filled: false, isRequired: true, options: [] }],
    })]} />);

    fireEvent.change(screen.getByLabelText(/Emergency phone/), { target: { value: "+44 20 7946 0000" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(changed).toHaveBeenCalled());
    expect(updateUserAttributesAction).toHaveBeenCalledWith({ userId: "p1", values: { a1: "+44 20 7946 0000" } });
  });

  it("sends a field the row cannot show to the profile", () => {
    render(<TaskList tasks={[task({
      kind: "FILL_FIELDS",
      fields: [{ id: "a1", name: "Mentor", type: "PERSON", filled: false, isRequired: false, options: [] }],
    })]} />);
    expect(screen.getByRole("link", { name: "Fill In on the Profile" })).toHaveAttribute("href", "/organization/people/p1/personal");
  });

  it("opens a questionnaire for its assignee and nobody else", () => {
    const q = task({ kind: "QUESTIONNAIRE", questions: [{ id: "q1", label: "How was it?", type: "SHORT_TEXT", required: true }] });
    const { rerender } = render(<TaskList tasks={[q]} isMine={() => false} />);
    expect(screen.queryByRole("button", { name: "Answer" })).not.toBeInTheDocument();

    rerender(<TaskList tasks={[q]} isMine={() => true} />);
    fireEvent.click(screen.getByRole("button", { name: "Answer" }));
    expect(screen.getByTestId("questionnaire-form")).toBeInTheDocument();
  });

  it("offers editing a running process's task only when it is given the means", () => {
    const { rerender } = render(<TaskList tasks={[task()]} />);
    expect(screen.queryByRole("button", { name: "Task Actions" })).not.toBeInTheDocument();
    rerender(<TaskList tasks={[task()]} onEditAction={jest.fn()} onCancelAction={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Task Actions" })).toBeInTheDocument();
  });
});
