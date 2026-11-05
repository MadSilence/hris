import { translatorFor } from "@/test/nextIntl";
import type { ReviewsT } from "./i18n";
import { lockedText, reviewNoticeLines, reviewNoticeText } from "./notices";

const t = translatorFor("reviews") as unknown as ReviewsT;
const code = (c: string, params: Record<string, string> = {}) => ({ code: c, params });

describe("review notices from their codes", () => {
  it("words a launch blocker, the kind through the review-kind label", () => {
    expect(reviewNoticeText(t, code("KIND_NO_FORM", { kind: "SELF" }))).toBe("Self review: there is no form.");
    expect(reviewNoticeText(t, code("KIND_FORM_ARCHIVED", { kind: "PEER" }))).toBe("Peer review: the form is archived.");
    expect(reviewNoticeText(t, code("NO_KINDS"))).toBe("Choose at least one kind of review.");
    expect(reviewNoticeText(t, code("PERSON_NOT_EMPLOYED", { name: "Anna Berg" }))).toBe("Anna Berg does not work here now.");
  });

  it("counts in a warning with a plural", () => {
    expect(reviewNoticeText(t, code("FEW_REPORTS_FOR_UPWARD", { count: "1", threshold: "3" })))
      .toBe("1 person manages fewer direct reports than the upward anonymity threshold of 3: their upward reviews will be held back.");
    expect(reviewNoticeText(t, code("PEER_MAX_BELOW_ANONYMITY", { peerMax: "2", threshold: "3" })))
      .toBe("At most 2 peers review one person, fewer than the anonymity threshold of 3: nobody will read their anonymous peer reviews.");
    expect(reviewNoticeText(t, code("REVIEWER_CAP_EXCEEDED", { name: "Ola", count: "6" })))
      .toBe("Ola now writes 6 peer reviews in this cycle.");
  });

  it("falls back to the server's English for an unknown code, bad params or codes that do not pair", () => {
    const english = ["the self review has no form", "something new"];
    expect(reviewNoticeLines(t, english, [code("KIND_NO_FORM", { kind: "SELF" }), code("SOMETHING_NEW")]))
      .toEqual(["Self review: there is no form.", "Something new."]);
    expect(reviewNoticeLines(t, english, undefined)).toEqual(["The self review has no form.", "Something new."]);
    expect(reviewNoticeLines(t, english, [code("NO_KINDS")])).toEqual(["The self review has no form.", "Something new."]);
    expect(reviewNoticeText(t, code("KIND_NO_FORM", { kind: "SOMEONE" }))).toBeNull();
  });

  it("says why a calibration row is locked", () => {
    expect(lockedText(t, { lockedReason: "they were taken out of the cycle", lockedCode: code("LOCKED_REMOVED") }))
      .toBe("Read-only: they were taken out of the cycle.");
    expect(lockedText(t, { lockedReason: "it is late", lockedCode: code("LOCKED_LATER") })).toBe("Read-only: it is late.");
    expect(lockedText(t, { lockedReason: "it is late" }, "nineBox.readOnly")).toBe("Read-only: it is late");
    expect(lockedText(t, { lockedReason: null, lockedCode: null })).toBeNull();
  });
});
