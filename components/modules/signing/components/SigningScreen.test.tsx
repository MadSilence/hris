import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { EnvelopeDTO } from "@/api/modules/signing/dto";
import { ActionStatus } from "@/components/models/ActionStatus";

jest.mock("next/font/google", () => ({ Marck_Script: () => ({ className: "marck" }) }));
jest.mock("qrcode", () => ({ toDataURL: jest.fn(async () => "data:image/png;base64,AAAA") }));
jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: {
    fetch: jest.fn(async () => ({ ok: true, blob: async () => new Blob(["%PDF-"]) })),
    post: jest.fn(async () => ({ drawing: null, at: null })),
  },
}));
jest.mock("../actions", () => ({
  sendSigningCodeAction: jest.fn(async () => ({ status: "SUCCESS" })),
  signAction: jest.fn(async () => ({ status: "SUCCESS" })),
  declineSigningAction: jest.fn(async () => ({ status: "SUCCESS" })),
  drawingLinkAction: jest.fn(),
}));

import { SigningScreen } from "./SigningScreen";
import { CodeBoxes } from "./CodeBoxes";
import * as actions from "../actions";

import { internalApiClient } from "@/components/clients/apiClient";

beforeAll(() => {
  Object.defineProperty(URL, "createObjectURL", { value: () => "blob:doc", configurable: true });
  Object.defineProperty(URL, "revokeObjectURL", { value: () => undefined, configurable: true });
});

// The config resets mocks before each test: the implementations go back in here.
beforeEach(() => {
  (internalApiClient.fetch as jest.Mock).mockImplementation(async () => ({ ok: true, blob: async () => new Blob(["%PDF-"]) }));
  (internalApiClient.post as jest.Mock).mockImplementation(async () => ({ drawing: null, at: null }));
  (actions.sendSigningCodeAction as jest.Mock).mockImplementation(async () => ({ status: "SUCCESS" }));
  (actions.signAction as jest.Mock).mockImplementation(async () => ({ status: "SUCCESS" }));
  (actions.declineSigningAction as jest.Mock).mockImplementation(async () => ({ status: "SUCCESS" }));
});

const signer = (id: string, order: number, name: string, status: "WAITING" | "PENDING" | "SIGNED", userId: string | null = id) => ({
  id, order, label: null, userId, name, email: `${id}@acme.test`, isGuest: userId === null, status,
  pendingSince: null, signedAt: null, declinedAt: null, declineReason: null,
});

const envelope = (over: Partial<EnvelopeDTO> = {}): EnvelopeDTO => ({
  id: "env-1", title: "Employment contract 2026", status: "SENT", subjectUserId: "meryem", sourceDocumentId: "doc-1",
  signedDocumentId: null, templateId: null, documentHash: "abc", sentBy: "lena", sentAt: "2026-11-17T10:00:00Z",
  expiresAt: "2026-12-17T10:00:00Z", completedAt: null, closedAt: null, closeReason: null,
  signers: [signer("meryem", 1, "Meryem Alaoui", "PENDING"), signer("tomas", 2, "Tomas Petrauskas", "WAITING")],
  sentByName: "Lena Novak", youSignerId: "meryem", ...over,
});

const screenFor = (e: EnvelopeDTO, you: string | null = "meryem") =>
  render(
    <SigningScreen party={{ kind: "member", envelopeId: e.id }} envelope={e} youSignerId={you} senderName="Lena Novak"
                   backHref="/dashboard" backLabel="Back to Home" />,
  );

describe("the signing screen (documents-signing)", () => {
  it("G02: who asks, the step chain with You, Sign and Decline", async () => {
    screenFor(envelope());
    expect(screen.getByText("Lena Novak asks you to sign")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Tomas Petrauskas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decline" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTitle("Employment contract 2026")).toBeInTheDocument());
  });

  it("Sign sends the code to the signer's email and asks for it (G03a)", async () => {
    screenFor(envelope());
    fireEvent.click(screen.getByRole("button", { name: /Sign/ }));
    await waitFor(() => expect(screen.getByText("Check your email")).toBeInTheDocument());
    expect(actions.sendSigningCodeAction).toHaveBeenCalledWith({ kind: "member", envelopeId: "env-1" }, expect.any(String));
    expect(screen.getByText(/meryem@acme.test/)).toBeInTheDocument();
  });

  it("G07: a later signer reads it, with no Sign", () => {
    screenFor(envelope(), "tomas");
    expect(screen.getByText("It’s not your turn yet")).toBeInTheDocument();
    expect(screen.getByText("Meryem Alaoui signs first. We’ll email you when it’s your turn.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Sign$/ })).not.toBeInTheDocument();
  });

  it("G08: a closed signing says so and does not show the document", () => {
    screenFor(envelope({ status: "CANCELLED" }));
    expect(screen.getByText("This signing request is closed")).toBeInTheDocument();
    expect(screen.queryByTitle("Employment contract 2026")).not.toBeInTheDocument();
  });

  it("G06: declining needs a comment", async () => {
    screenFor(envelope());
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Decline" }).at(-1)!);
    expect(await screen.findByText("Say why you decline.")).toBeInTheDocument();
    expect(actions.declineSigningAction).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Comment/), { target: { value: "Wrong start date" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Decline" }).at(-1)!);
    await waitFor(() =>
      expect(actions.declineSigningAction).toHaveBeenCalledWith({ kind: "member", envelopeId: "env-1" }, "Wrong start date"),
    );
    expect(await screen.findByText("You declined. Lena Novak has been told.")).toBeInTheDocument();
  });

  it("the code, then the typed name, sign it (G03 → G04)", async () => {
    screenFor(envelope());
    fireEvent.click(screen.getByRole("button", { name: /Sign/ }));
    await screen.findByText("Check your email");
    fireEvent.change(screen.getByLabelText("Digit 1"), { target: { value: "482913" } });
    expect(await screen.findByText("Code confirmed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Sign/ }));
    await waitFor(() =>
      expect(actions.signAction).toHaveBeenCalledWith({ kind: "member", envelopeId: "env-1" },
        expect.objectContaining({ code: "482913", signedName: "Meryem Alaoui", drawing: null })),
    );
    expect(await screen.findByText("You signed")).toBeInTheDocument();
    expect(screen.getByText("Tomas Petrauskas")).toBeInTheDocument();
    expect(screen.getByText("You’ll get the signed copy when everyone has signed.")).toBeInTheDocument();
  });

  it("the last signature says the copy is already on its way (walk of 2026-11-18)", async () => {
    (actions.signAction as jest.Mock).mockImplementation(async () => ({ status: "SUCCESS", data: { completed: true } }));
    screenFor(envelope());
    fireEvent.click(screen.getByRole("button", { name: /Sign/ }));
    await screen.findByText("Check your email");
    fireEvent.change(screen.getByLabelText("Digit 1"), { target: { value: "482913" } });
    await screen.findByText("Code confirmed");
    fireEvent.click(screen.getByRole("button", { name: /Sign/ }));
    expect(await screen.findByText("Everyone has signed. The signed copy is in Documents.")).toBeInTheDocument();
    expect(screen.queryByText("Tomas Petrauskas")).not.toBeInTheDocument();
  });
});

describe("CodeBoxes", () => {
  it("sends the sixth digit, typed or pasted", () => {
    const done = jest.fn();
    render(<CodeBoxes onCompleteAction={done} />);
    "12345".split("").forEach((d, i) => fireEvent.change(screen.getByLabelText(`Digit ${i + 1}`), { target: { value: d } }));
    expect(done).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Digit 6"), { target: { value: "6" } });
    expect(done).toHaveBeenCalledWith("123456");
  });
});

void ActionStatus;
