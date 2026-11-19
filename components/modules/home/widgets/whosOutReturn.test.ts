import { isOnlyToday, runsPastWeek } from "./WhosOutWidget";
import type { WhosOutPerson } from "@/models/home";

jest.mock("@/components/modules/home/hooks", () => ({ useWhosOut: jest.fn() }));

const TODAY = "2026-11-19";
const person = (over: Partial<WhosOutPerson>): WhosOutPerson => ({
  userId: "u",
  firstName: "A",
  lastName: "B",
  avatarUrl: null,
  startDate: TODAY,
  endDate: TODAY,
  status: "APPROVED",
  ...over,
});

describe("Who's out: a day off that is only today (O4)", () => {
  it("reads today only when the leave itself starts and ends today", () => {
    expect(isOnlyToday(person({ firstDay: TODAY, lastDay: TODAY }), TODAY)).toBe(true);
  });

  it("is not today when the card cut a longer leave to today (walk of 2026-11-19: out Thu–Fri read 'today')", () => {
    expect(isOnlyToday(person({ firstDay: TODAY, lastDay: "2026-11-20", backOn: "2026-11-23" }), TODAY)).toBe(false);
  });

  it("is not today when the leave started earlier or runs past what was read", () => {
    expect(isOnlyToday(person({ firstDay: "2026-11-17", lastDay: TODAY }), TODAY)).toBe(false);
    expect(isOnlyToday(person({ firstDay: TODAY, lastDay: null }), TODAY)).toBe(false);
  });
});

describe("Who's out: a leave that runs past the week (O6)", () => {
  it("runs past Friday by its own last day, though the server cut its end to the window", () => {
    expect(runsPastWeek(person({ endDate: "2026-11-20", lastDay: "2026-12-04" }), "2026-11-20")).toBe(true);
  });

  it("ends this week when its last day is Friday", () => {
    expect(runsPastWeek(person({ endDate: "2026-11-20", lastDay: "2026-11-20" }), "2026-11-20")).toBe(false);
  });
});
