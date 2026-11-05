import { translatorFor } from "@/test/nextIntl";
import type { ReviewsT } from "./i18n";
import { nominationProblem, stepHref } from "./steps";

const t = translatorFor("reviews") as unknown as ReviewsT;

describe("review steps", () => {
  const nomination = { peerMin: 2, peerMax: 3, excluded: ["me", "my-manager"] };

  it("accepts a nomination within the least and the most", () => {
    expect(nominationProblem(["a", "b"], nomination, t)).toBeNull();
    expect(nominationProblem(["a", "b", "c"], nomination, t)).toBeNull();
  });

  it("counts each person once", () => {
    expect(nominationProblem(["a", "a"], nomination, t)).toBe("Choose between 2 and 3 peers.");
  });

  it("refuses too few, too many, the person and their manager", () => {
    expect(nominationProblem(["a"], nomination, t)).toBe("Choose between 2 and 3 peers.");
    expect(nominationProblem(["a", "b", "c", "d"], nomination, t)).toBe("Choose between 2 and 3 peers.");
    expect(nominationProblem(["a", "me"], nomination, t)).toBe("Neither the person nor their manager can be chosen.");
    expect(nominationProblem(["a", "my-manager"], nomination, t)).toBe("Neither the person nor their manager can be chosen.");
  });

  it("says an exact number when the least and the most agree", () => {
    expect(nominationProblem([], { peerMin: 1, peerMax: 1, excluded: [] }, t)).toBe("Choose 1 peer.");
    expect(nominationProblem(["a"], { peerMin: 3, peerMax: 3, excluded: [] }, t)).toBe("Choose 3 peers.");
  });

  it("leads each step to its page", () => {
    expect(stepHref("NOMINATE_PEERS", "p1")).toBe("/reviews/nominations/p1");
    expect(stepHref("APPROVE_PEERS", "p1")).toBe("/reviews/nominations/p1");
    expect(stepHref("APPROVE_REVIEW", "p1")).toBe("/reviews/packets/p1");
  });
});
