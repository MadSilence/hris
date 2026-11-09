import {
  ERROR_MESSAGES,
  fallbackErrorMessage,
  SERVER_TEXT_CODES,
  messageForCode,
  messageForError,
} from "@/lib/errors/errorMessages";
import { setBrowserCatalogue } from "@/i18n/catalogue";
import { messagesFor } from "@/i18n/messages";
import { BackendUnavailableError, ConflictError } from "@/components/clients/exceptions";

describe("messageForCode", () => {
  it("prefers the dictionary over whatever the server wrote", () => {
    expect(messageForCode("D00017", "Document folder is not empty")).toBe(
      "This folder still has files in it. Empty it first.",
    );
  });

  /**
   * The set is empty now, and that is the point of this test.
   *
   * Forty-six codes used to live on the backend's own wording because their message carries values
   * ("Unknown attribute: {0}") and the values were only available inside the formatted sentence.
   * They travel as `params` since 2026-09-07, so every one of those codes has a real entry and the
   * escape hatch has nothing in it. Keeping the mechanism under test means the next code that needs
   * it still works.
   */
  it("has nothing left on the server's own wording", () => {
    expect(SERVER_TEXT_CODES.size).toBe(0);
  });

  it("fills the values the backend sent into our own sentence", () => {
    expect(messageForCode("AV0001", "Unknown attribute: hireDate", ["Hire date"])).toBe(
      "That field no longer exists (Hire date). Refresh the page.",
    );
  });

  it("fills more than one, in order", () => {
    expect(messageForCode("AV0014", "x must be between 1 and 5", ["Age", "18", "65"])).toBe(
      "Age must be between 18 and 65.",
    );
  });

  /**
   * A placeholder with no value stays visible. "must be at least " reads as a sentence somebody
   * wrote badly; "must be at least {1}" reads as unfinished, which is what it is.
   */
  it("leaves a placeholder alone when its value is missing", () => {
    expect(messageForCode("AV0006", "x must be at least 3", ["Age"])).toBe("Age must be at least {1}.");
  });

  it("falls back for a code the dictionary does not know", () => {
    expect(messageForCode("D99999", "Some technical wording")).toBe(fallbackErrorMessage());
  });

  it("falls back when there is no code at all", () => {
    expect(messageForCode(undefined, "Some technical wording")).toBe(fallbackErrorMessage());
  });

  it("never leaks the backend's technical wording for an unknown code", () => {
    expect(messageForCode("NOPE", "NullPointerException at line 42")).not.toContain("NullPointer");
  });
});

describe("counts in an error", () => {
  it("agree with their number, in both languages", () => {
    expect(messageForCode("AV0015", undefined, ["Skills", "1"], "en")).toContain("at least 1 option for");
    expect(messageForCode("AV0015", undefined, ["Skills", "3"], "en")).toContain("at least 3 options for");
    setBrowserCatalogue(messagesFor("ru"));
    expect(messageForCode("BE0007", undefined, ["5", "2"], "ru")).toContain("5 сотрудников");
    expect(messageForCode("BE0007", undefined, ["2", "1"], "ru")).toContain("2 сотрудников");
    setBrowserCatalogue(messagesFor("en"));
  });

  it("leave a parameter outside a plural unformatted", () => {
    expect(messageForCode("AT00007", undefined, ["2026", "1"], "en")).toContain("“2026” is used by 1 person");
  });
});

describe("messageForError", () => {
  it("reads the code off an ApiError", () => {
    const error = new ConflictError("Document folder is not empty", { code: "D00017", status: 409 });

    expect(messageForError(error)).toBe("This folder still has files in it. Empty it first.");
  });

  it("has wording for an unreachable backend", () => {
    expect(messageForError(new BackendUnavailableError("connect ECONNREFUSED"))).toBe(
      ERROR_MESSAGES.E00503 ?? fallbackErrorMessage(),
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
    expect(messageForError(new Error(""))).toBe(fallbackErrorMessage());
    expect(messageForError("boom")).toBe(fallbackErrorMessage());
    expect(messageForError(undefined)).toBe(fallbackErrorMessage());
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
