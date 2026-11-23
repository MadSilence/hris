import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { EnvelopeDTO } from "@/api/modules/signing/dto";

jest.mock("@/components/audience/hooks/useSegmentResolve", () => ({
  useSegmentResolve: () => ({
    isLoading: false,
    items: [{ id: "inga", firstName: "Inga", lastName: "Kazlauskė", email: null, extras: { job: { id: "j", name: "Payroll" }, office: { id: "o", name: "Vilnius" } } }],
  }),
}));
jest.mock("../actions", () => ({
  sendForSignatureAction: jest.fn(),
  remindSigningAction: jest.fn(),
  cancelSigningAction: jest.fn(),
}));
jest.mock("../hooks/useSigning", () => ({
  useSigningHistory: () => ({
    data: [
      { kind: "SENT", at: "2026-11-14T09:40:00Z", who: "Lena Novak", guest: false, comment: null, envelopeId: "env-1" },
      { kind: "DECLINED", at: "2026-11-14T15:10:00Z", who: "Tomas Petrauskas", guest: false, comment: "The start date is wrong", envelopeId: "env-1" },
    ],
  }),
}));
jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn(), showActionError: jest.fn() }));

import { SendForSignatureDialog, stepsFrom } from "./SendForSignatureDialog";
import { SigningPanel } from "./SigningPanel";
import * as actions from "../actions";
import { showSuccess } from "@/lib/errors/errorToast";

const signer = (id: string, order: number, name: string, status: "WAITING" | "PENDING" | "SIGNED" | "DECLINED", guest = false) => ({
  id, order, label: null, userId: guest ? null : id, name, email: guest ? `${id}@example.org` : null, isGuest: guest, status,
  pendingSince: null, signedAt: status === "SIGNED" ? "2026-11-17T14:02:00Z" : null, declinedAt: null,
  declineReason: status === "DECLINED" ? "Wrong start date" : null,
});

const envelope = (over: Partial<EnvelopeDTO> = {}): EnvelopeDTO => ({
  id: "env-1", title: "Employment contract 2026", status: "SENT", subjectUserId: "meryem", sourceDocumentId: "doc-1",
  signedDocumentId: null, templateId: null, documentHash: "abc", sentBy: "lena", sentAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  expiresAt: new Date(Date.now() + 28 * 86_400_000).toISOString(), completedAt: null, closedAt: null, closeReason: null,
  signers: [signer("meryem", 1, "Meryem Alaoui", "SIGNED"), signer("daniel", 2, "Daniel Kim", "PENDING", true)],
  sentByName: "Lena Novak", ...over,
});

const open = (extra: Partial<React.ComponentProps<typeof SendForSignatureDialog>> = {}) =>
  render(<SendForSignatureDialog open documentId="doc-1" fileName="Contract.pdf" person={{ id: "meryem", name: "Meryem Alaoui" }}
                                 onCloseAction={() => undefined} onSentAction={() => undefined} {...extra} />);

describe("Send for signature (S02–S05)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (actions.sendForSignatureAction as jest.Mock).mockResolvedValue({ status: "SUCCESS", data: envelope() });
  });

  it("starts with the person in step one, sends the steps as orders, and says who signs first (S4)", async () => {
    const sent = jest.fn();
    open({ onSentAction: sent });
    expect(screen.getByDisplayValue("Contract")).toBeInTheDocument();
    expect(screen.getByText("Meryem Alaoui")).toBeInTheDocument();
    expect(screen.getByText("The person")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(actions.sendForSignatureAction).toHaveBeenCalledWith({
      documentId: "doc-1", title: "Contract", signers: [{ userId: "meryem", order: 1 }],
    }));
    expect(sent).toHaveBeenCalled();
    expect(showSuccess).toHaveBeenCalledWith("Sent for signature. Meryem signs first");
  });

  it("their manager is first in the menu, the next step after the person (A7); a demo says who gets mail (S3)", async () => {
    open({ manager: { id: "lena", name: "Lena Novak" }, demo: true });
    expect(screen.getByText(/In a demo only the owners get email/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add next signer" }));
    fireEvent.click(screen.getByRole("button", { name: /Their manager/ }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(actions.sendForSignatureAction).toHaveBeenCalledWith({
      documentId: "doc-1", title: "Contract", signers: [{ userId: "meryem", order: 1 }, { userId: "lena", order: 2 }],
    }));
  });

  it("no demo note outside a demo (S3)", () => {
    open();
    expect(screen.queryByText(/In a demo only the owners get email/)).not.toBeInTheDocument();
  });

  it("a guest needs a name and an email before anything is sent (S05)", async () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "Add next signer" }));
    fireEvent.click(screen.getByRole("button", { name: /Someone outside the company/ }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Enter their name.")).toBeInTheDocument();
    expect(screen.getByText("Enter their email.")).toBeInTheDocument();
    expect(actions.sendForSignatureAction).not.toHaveBeenCalled();
  });

  it("the field is the search: people with their job and office (S03)", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "Add co-signer" }));
    expect(screen.getByRole("textbox", { name: "Find a person" })).toBeInTheDocument();
    expect(screen.getByText("Payroll · Vilnius")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Inga Kazlauskė/ }));
    expect(screen.queryByRole("textbox", { name: "Find a person" })).not.toBeInTheDocument();
    expect(screen.getByText("Payroll · Vilnius")).toBeInTheDocument();
  });

  it("Send again keeps the same people in the same boxes (S08e)", () => {
    const steps = stepsFrom(envelope());
    expect(steps).toHaveLength(2);
    expect(steps[1][0]).toMatchObject({ kind: "guest", guestName: "Daniel Kim", guestEmail: "daniel@example.org" });
  });
});

describe("the Signing panel (S07, S08)", () => {
  it("open: sent by, days left, the reminders' rule, remind and cancel", () => {
    render(<SigningPanel envelope={envelope()} canSend onChangedAction={() => undefined} onSendAgainAction={() => undefined} />);
    expect(screen.getByText(/Sent by Lena Novak/)).toBeInTheDocument();
    expect(screen.getByText(/days left/)).toBeInTheDocument();
    expect(screen.getByText("Reminders go out on day 3 and the day before it’s due")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send a reminder now" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel signing" })).toBeInTheDocument();
  });

  it("open: the count pill, each signer's state, and Cancel signing left to the preview's footer", () => {
    render(<SigningPanel envelope={envelope()} canSend cancelInFooter onChangedAction={() => undefined} onSendAgainAction={() => undefined} />);
    expect(screen.getByText("1 of 2 signed")).toBeInTheDocument();
    // The step rule (STEPS.md): the role and the state share the line under the name.
    expect(screen.getByText(/^The person · /)).toBeInTheDocument();
    expect(screen.getByText("Who signs")).toBeInTheDocument();
    expect(screen.getByText(/(^| · )To sign$/)).toBeInTheDocument();
    expect(screen.getByText(/(^| · )Signed .*, /)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel signing" })).not.toBeInTheDocument();
  });

  it("declined: the comment under the decliner, the others not asked any more, and Send again", () => {
    const again = jest.fn();
    render(<SigningPanel envelope={envelope({ status: "DECLINED", signers: [signer("meryem", 1, "Meryem Alaoui", "DECLINED"), signer("lena", 2, "Lena Novak", "WAITING")] })}
                         canSend onChangedAction={() => undefined} onSendAgainAction={again} />);
    expect(screen.getByText("“Wrong start date”")).toBeInTheDocument();
    expect(screen.getByText("Not asked any more")).toBeInTheDocument();
    expect(screen.getByText("Nobody can sign it now.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send again" }));
    expect(again).toHaveBeenCalled();
  });

  it("without the right to send, nothing to press but the history", () => {
    render(<SigningPanel envelope={envelope()} canSend={false} onChangedAction={() => undefined} onSendAgainAction={() => undefined} />);
    expect(screen.queryByRole("button", { name: "Cancel signing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send a reminder now" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Signing history" })).toBeInTheDocument();
  });

  it("Signing history replaces the panel in place, with the decline's comment (S13b)", () => {
    render(<SigningPanel envelope={envelope()} canSend onChangedAction={() => undefined} onSendAgainAction={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Signing history" }));
    expect(screen.getByText("Lena Novak")).toBeInTheDocument();
    expect(screen.getByText(/sent it for signature/)).toBeInTheDocument();
    expect(screen.getByText("The start date is wrong")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to signing" }));
    expect(screen.getByText("Signing")).toBeInTheDocument();
  });

  it("cancel confirm names whose signature is dropped (S09)", () => {
    render(<SigningPanel envelope={envelope()} canSend onChangedAction={() => undefined} onSendAgainAction={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel signing" }));
    expect(screen.getByText("Nobody can sign it any more. Meryem’s signature is dropped; the document stays as it was.")).toBeInTheDocument();
    expect(screen.getByText("Employment contract 2026")).toBeInTheDocument();
  });
});
