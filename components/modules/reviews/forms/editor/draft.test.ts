import type { ReviewQuestion, ReviewsT } from "@/models/reviews";
import { copyOf, markOverall, move, newQuestion, problemsOf, retype, sameDraft, toWrite, type Draft } from "./draft";
import { translatorFor } from "@/test/nextIntl";

const t = translatorFor("reviews") as unknown as ReviewsT;

const q = (p: Partial<ReviewQuestion>): ReviewQuestion => ({ id: crypto.randomUUID(), type: "LONG_TEXT", label: "Why?", ...p });

describe("review form draft", () => {
  it("starts a rating required and a choice with two empty options", () => {
    expect(newQuestion("RATING").required).toBe(true);
    expect(newQuestion("SINGLE_CHOICE").options).toEqual(["", ""]);
    expect(newQuestion("SECTION").required).toBeUndefined();
  });

  it("keeps on retype only what still means something", () => {
    const rating = q({ type: "RATING", overall: true, required: true, description: "Be fair" });
    const asText = retype(rating, "LONG_TEXT");
    expect(asText.overall).toBeNull();
    expect(asText.description).toBe("Be fair");
    expect(retype(asText, "SECTION").required).toBeNull();
    expect(retype(q({ type: "SINGLE_CHOICE", options: ["A", "B"] }), "MULTIPLE_CHOICE").options).toEqual(["A", "B"]);
  });

  it("allows one overall rating: marking another moves the mark", () => {
    const a = q({ type: "RATING", overall: true });
    const b = q({ type: "RATING" });
    const marked = markOverall([a, b, q({})], b.id, true);
    expect(marked.map((x) => x.overall ?? null)).toEqual([null, true, null]);
    expect(copyOf(marked[1]).overall).toBeNull();
    expect(copyOf(marked[1]).id).not.toBe(b.id);
  });

  it("moves within bounds and not past them", () => {
    expect(move([1, 2, 3], 0, 1)).toEqual([2, 1, 3]);
    expect(move([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
  });

  it("names the entries a save would refuse", () => {
    const blank = q({ label: "  " });
    const section = q({ type: "SECTION", label: "" });
    const oneOption = q({ type: "SINGLE_CHOICE", options: ["Yes", " Yes ", ""] });
    const fine = q({});
    expect(problemsOf([blank, section, oneOption, fine], t)).toEqual({
      [blank.id]: "Write the question.",
      [section.id]: "Give the section a heading.",
      [oneOption.id]: "Give at least two different options.",
    });
  });

  it("sends trimmed text, no empty options and nothing a section does not carry", () => {
    const draft: Draft = {
      name: " Manager review ",
      description: "  ",
      questions: [
        q({ type: "SECTION", label: " Delivery ", required: true }),
        q({ type: "MULTIPLE_CHOICE", label: "Pick", options: [" A ", "", "B"], overall: true }),
      ],
    };
    const body = toWrite(draft, 3);
    expect(body.name).toBe("Manager review");
    expect(body.description).toBeNull();
    expect(body.version).toBe(3);
    expect(body.questions[0]).toMatchObject({ label: "Delivery", required: null, options: null });
    expect(body.questions[1]).toMatchObject({ options: ["A", "B"], overall: null, required: false });
  });

  it("treats a draft that would save the same form as unchanged", () => {
    const base: Draft = { name: "Self review", description: "", questions: [q({ label: "Why?" })] };
    expect(sameDraft(base, { ...base, name: "Self review " })).toBe(true);
    expect(sameDraft(base, { ...base, questions: [{ ...base.questions[0], required: true }] })).toBe(false);
  });
});
