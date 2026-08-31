import {
  ERROR_MESSAGES,
  FALLBACK_ERROR_MESSAGE,
  SERVER_TEXT_CODES,
  messageForCode,
  messageForError,
} from "@/lib/errors/errorMessages";
import { BackendUnavailableError, ConflictError } from "@/components/clients/exceptions";

describe("messageForCode", () => {
  it("prefers the dictionary over whatever the server wrote", () => {
    expect(messageForCode("D00017", "Document folder is not empty")).toBe(
      "This folder still has files in it. Empty it first.",
    );
  });

  it("keeps the server text for codes whose message carries values", () => {
    const code = SERVER_TEXT_CODES.values().next().value as string;

    expect(messageForCode(code, "Unknown attribute: hireDate")).toBe("Unknown attribute: hireDate");
  });

  it("falls back for a code the dictionary does not know", () => {
    expect(messageForCode("D99999", "Some technical wording")).toBe(FALLBACK_ERROR_MESSAGE);
  });

  it("falls back when there is no code at all", () => {
    expect(messageForCode(undefined, "Some technical wording")).toBe(FALLBACK_ERROR_MESSAGE);
  });

  it("never leaks the backend's technical wording for an unknown code", () => {
    expect(messageForCode("NOPE", "NullPointerException at line 42")).not.toContain("NullPointer");
  });
});

describe("messageForError", () => {
  it("reads the code off an ApiError", () => {
    const error = new ConflictError("Document folder is not empty", { code: "D00017", status: 409 });

    expect(messageForError(error)).toBe("This folder still has files in it. Empty it first.");
  });

  it("has wording for an unreachable backend", () => {
    expect(messageForError(new BackendUnavailableError("connect ECONNREFUSED"))).toBe(
      ERROR_MESSAGES.E00503 ?? FALLBACK_ERROR_MESSAGE,
    );
  });

  it("keeps the message of a plain Error — a hook has already resolved it", () => {
    // useMutation wrappers throw `new Error(result.errorMessage)`, and that message came out of
    // toActionError. Re-resolving it would find no code and lose the reason.
    expect(messageForError(new Error("This folder still has files in it. Empty it first."))).toBe(
      "This folder still has files in it. Empty it first.",
    );
  });

  it("falls back when there is nothing to say", () => {
    expect(messageForError(new Error(""))).toBe(FALLBACK_ERROR_MESSAGE);
    expect(messageForError("boom")).toBe(FALLBACK_ERROR_MESSAGE);
    expect(messageForError(undefined)).toBe(FALLBACK_ERROR_MESSAGE);
  });
});

describe("the dictionary itself", () => {
  it("has no entry that is also listed as server-text — one of the two would be dead", () => {
    const both = [...SERVER_TEXT_CODES].filter((code) => ERROR_MESSAGES[code] !== undefined);

    expect(both).toEqual([]);
  });

  it("has no empty text", () => {
    const empty = Object.entries(ERROR_MESSAGES).filter(([, text]) => text.trim() === "");

    expect(empty).toEqual([]);
  });
});
