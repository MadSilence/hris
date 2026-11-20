import { mustReadHint } from "./overviewHints";

// CM01, WALK_QUESTIONS § 44: the tile says "No must-read pages" only when there are none at all.
describe("mustReadHint", () => {
  const base = { openMustRead: 0, openAgreed: 0, openNeeded: 0, missedPages: 0 };

  it("counts the agreed among the open pages", () => {
    expect(mustReadHint({ ...base, openMustRead: 2, openAgreed: 3, openNeeded: 10, missedPages: 1 }))
      .toEqual({ key: "agreedOf", values: { agreed: 3, needed: 10 } });
  });

  it("with none open but some past the deadline, counts those", () => {
    expect(mustReadHint({ ...base, missedPages: 2 })).toEqual({ key: "pastDeadline", values: { count: 2 } });
  });

  it("says there are none only when there are none", () => {
    expect(mustReadHint(base)).toEqual({ key: "noMustRead" });
  });
});
