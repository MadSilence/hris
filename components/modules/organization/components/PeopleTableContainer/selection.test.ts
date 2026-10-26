import { bulkTargetFor, heldCountFor, offersAllMatching } from "./selection";
import type { FilterDTO } from "@/models/user/fields";

const archived: FilterDTO[] = [{ field: "sys:status", op: "eq", value: "ARCHIVED" }];

describe("Select All N Matching", () => {
  it("is offered once every loaded row is held and the table holds more", () => {
    expect(offersAllMatching(["a", "b"], new Set(["a", "b"]), 312, false)).toBe(true);
  });

  it("is not offered while a loaded row is left out", () => {
    expect(offersAllMatching(["a", "b"], new Set(["a"]), 312, false)).toBe(false);
  });

  it("is not offered when the loaded rows are the whole table", () => {
    expect(offersAllMatching(["a", "b"], new Set(["a", "b"]), 2, false)).toBe(false);
  });

  it("waits for the count rather than guessing it", () => {
    expect(offersAllMatching(["a", "b"], new Set(["a", "b"]), null, false)).toBe(false);
  });

  it("stays up once the whole set is chosen, to say so and to clear it", () => {
    expect(offersAllMatching(["a", "b"], new Set(["a", "b"]), 2, true)).toBe(true);
  });
});

describe("what a bulk edit is sent", () => {
  it("sends the table's query, not the loaded ids, once the whole set is chosen", () => {
    expect(bulkTargetFor(true, new Set(["a", "b"]), { filters: archived, q: "anna", drafts: "ONLY" })).toEqual({
      kind: "segment",
      filters: archived,
      q: "anna",
      drafts: "ONLY",
    });
  });

  it("sends the ids held otherwise", () => {
    expect(bulkTargetFor(false, new Set(["a", "b"]), { filters: archived })).toEqual({ kind: "ids", userIds: ["a", "b"] });
  });

  it("confirms the count of the whole set, not of the rows loaded", () => {
    expect(heldCountFor(true, new Set(["a", "b"]), 312)).toBe(312);
    expect(heldCountFor(false, new Set(["a", "b"]), 312)).toBe(2);
  });
});
