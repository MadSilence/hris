import { nominationProblem, stepHref } from "./steps";

describe("review steps", () => {
  const nomination = { peerMin: 2, peerMax: 3, excluded: ["me", "my-manager"] };

  it("accepts a nomination within the least and the most", () => {
    expect(nominationProblem(["a", "b"], nomination)).toBeNull();
    expect(nominationProblem(["a", "b", "c"], nomination)).toBeNull();
  });

  it("counts each person once", () => {
    expect(nominationProblem(["a", "a"], nomination)).toBe("Choose between 2 and 3 peers.");
  });

  it("refuses too few, too many, the person and their manager", () => {
    expect(nominationProblem(["a"], nomination)).toBe("Choose between 2 and 3 peers.");
    expect(nominationProblem(["a", "b", "c", "d"], nomination)).toBe("Choose between 2 and 3 peers.");
    expect(nominationProblem(["a", "me"], nomination)).toBe("Neither the person nor their manager can be chosen.");
    expect(nominationProblem(["a", "my-manager"], nomination)).toBe("Neither the person nor their manager can be chosen.");
  });

  it("says an exact number when the least and the most agree", () => {
    expect(nominationProblem([], { peerMin: 1, peerMax: 1, excluded: [] })).toBe("Choose 1 peer.");
    expect(nominationProblem(["a"], { peerMin: 3, peerMax: 3, excluded: [] })).toBe("Choose 3 peers.");
  });

  it("leads each step to its page", () => {
    expect(stepHref("NOMINATE_PEERS", "p1")).toBe("/reviews/nominations/p1");
    expect(stepHref("APPROVE_PEERS", "p1")).toBe("/reviews/nominations/p1");
    expect(stepHref("APPROVE_REVIEW", "p1")).toBe("/reviews/packets/p1");
  });
});
