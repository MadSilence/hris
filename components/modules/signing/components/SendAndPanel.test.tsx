import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { EnvelopeDTO } from "@/api/modules/signing/dto";

jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => ({
  UserPickerField: () => null,
}));
jest.mock("../actions", () => ({
  sendForSignatureAction: jest.fn(),
  remindSigningAction: jest.fn(),
  cancelSigningAction: jest.fn(),
}));
jest.mock("../hooks/useSigning", () => ({ useSigningHistory: () => ({ data: [] }) }));
jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn(), showActionError: jest.fn() }));

import { SendForSignatureDialog, stepsFrom } from "./SendForSignatureDialog";
import { SigningPanel } from "./SigningPanel";
import * as actions from "../actions";

const signer = (id: string, order: number, name: string, status: "WAITING" | "PENDING" | "SIGNED" | "DECLINED", guest = false) => ({
  id, order, label: null, userId: guest ? null : id, name, email: guest ? `${id}@example.org` : null, isGuest: guest, status,
  pendingSince: null, signedAt: null, declinedAt: null, declineReason: status === "DECLINED" ? "Wrong start date" : null,
});

const envelope = (over: Partial<EnvelopeDTO> = {}): EnvelopeDTO => ({
  id: "env-1", title: "Employment contract 2026", status: "SENT", subjectUserId: "meryem", sourceDocumentId: "doc-1",
  signedDocumentId: null, templateId: null, documentHash: "abc", sentBy: "lena", sentAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  expiresAt: new Date(Date.now() + 28 * 86_400_000).toISOString(), completedAt: null, closedAt: null, closeReason: null,
  signers: [signer("meryem", 1, "Meryem Alaoui", "SIGNED"), signer("daniel", 2, "Daniel Kim", "PENDING", true)],
  sentByName: "Lena Novak", ...over,
});

describe("Send for signature (S02–S05)", () => {
  beforeEach(() => {
    (actions.sendForSignatureAction as jest.Mock).mockResolvedValue({ status: "SUCCESS", data: envelope() });
  });

  it("starts with the person in step one and sends the steps as orders", async () => {
    const sent = jest.fn();
    render(<SendForSignatureDialog open documentId="doc-1" fileName="Contract.pdf" person={{ id: "meryem", name: "Meryem Alaoui" }}
                                   onCloseAction={() => undefined} onSentAction={sent} />);
    expect(screen.getByDisplayValue("Contract")).toBeInTheDocument();
    expect(screen.getByText("Meryem Alaoui")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(actions.sendForSignatureAction).toHaveBeenCalledWith({
      documentId: "doc-1", title: "Contract", signers: [{ userId: "meryem", order: 1 }],
    }));
    expect(sent).toHaveBeenCalled();
  });

  it("their manager is one click, the next step after the person (A7); a demo says who gets mail (B3)", async () => {
    render(<SendForSignatureDialog open documentId="doc-1" fileName="Contract.pdf" person={{ id: "meryem", name: "Meryem Alaoui" }}
                                   manager={{ id: "lena", name: "Lena Novak" }} demo
                                   onCloseAction={() => undefined} onSentAction={() => undefined} />);
    expect(screen.getByText(/In a demo only the owners get email/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add next signer" }));
    fireEvent.click(screen.getByRole("button", { name: "Their manager · Lena Novak" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(actions.sendForSignatureAction).toHaveBeenCalledWith({
      documentId: "doc-1", title: "Contract", signers: [{ userId: "meryem", order: 1 }, { userId: "lena", order: 2 }],
    }));
  });

  it("a guest needs a name and an email before anything is sent", async () => {
    render(<SendForSignatureDialog open documentId="doc-1" fileName="Contract.pdf" person={{ id: "meryem", name: "Meryem Alaoui" }}
                                   onCloseAction={() => undefined} onSentAction={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: /Add next signer/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Someone outside" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Someone outside/ }).at(-1)!);
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Every guest needs a name.")).toBeInTheDocument();
    expect(screen.getByText("Every guest needs an email.")).toBeInTheDocument();
    expect(actions.sendForSignatureAction).not.toHaveBeenCalled();
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

  it("declined: who and the comment, and Send again", () => {
    const again = jest.fn();
    render(<SigningPanel envelope={envelope({ status: "DECLINED", signers: [signer("meryem", 1, "Meryem Alaoui", "DECLINED")] })}
                         canSend onChangedAction={() => undefined} onSendAgainAction={again} />);
    expect(screen.getByText("Meryem Alaoui declined")).toBeInTheDocument();
    expect(screen.getByText(/Wrong start date/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send again" }));
    expect(again).toHaveBeenCalled();
  });

  it("without the right to send, nothing to press but the history", () => {
    render(<SigningPanel envelope={envelope()} canSend={false} onChangedAction={() => undefined} onSendAgainAction={() => undefined} />);
    expect(screen.queryByRole("button", { name: "Cancel signing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send a reminder now" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Signing history" })).toBeInTheDocument();
  });
});
