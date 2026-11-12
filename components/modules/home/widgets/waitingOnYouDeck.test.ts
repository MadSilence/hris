import type { TimeOffRequest } from "@/models/timeOff";
import type { Task } from "@/models/lifecycle";
import type { AgreementRow } from "@/models/hub";
import { partialMock } from "@/test/types";
import { buildDeck, cardKey, skipCard, writeKey } from "./waitingOnYouDeck";

const request = (id: string, createdAt: string, status = "PENDING") =>
  partialMock<TimeOffRequest>({ id, createdAt, status: status as TimeOffRequest["status"], userId: "u" });
const task = (id: string, kind: Task["kind"], dueDate: string | null, status: Task["status"] = "OPEN") =>
  partialMock<Task>({ id, kind, dueDate, status, title: id });

const deckOf = (overrides: Partial<Parameters<typeof buildDeck>[0]> = {}) =>
  buildDeck({
    requests: [request("late", "2026-11-10T10:00:00Z"), request("early", "2026-11-09T10:00:00Z"), request("cancel", "2026-11-11T08:00:00Z", "CANCELLATION_PENDING")],
    tasks: [
      task("t-later", "TODO", "2026-11-20"),
      task("t-soon", "TODO", "2026-11-12"),
      task("review", "REVIEW", "2026-11-15"),
      task("approve-run", "APPROVE_AUTOMATION", null),
      task("waiting", "TODO", "2026-11-11", "WAITING"),
    ],
    failedRuns: [{ id: "run1", ruleId: "r", ruleName: "Time off approval", person: null, reason: null }],
    skipped: [],
    held: new Set(),
    heldTask: () => false,
    ...overrides,
  });

describe("Waiting on you, the deck", () => {
  it("decides first (oldest first), then does (by due date), then reads", () => {
    expect(deckOf().map((c) => `${c.kind}:${c.key}`)).toEqual([
      "TIME_OFF:time-off:early",
      "TIME_OFF:time-off:late",
      "CANCELLATION:time-off:cancel",
      "AUTOMATION:task:approve-run",
      "TASK:task:t-soon",
      "REVIEW:task:review",
      "TASK:task:t-later",
      "FAILED_RUN:run:run1",
    ]);
  });

  it("puts what was skipped at the back, in the order it was skipped", () => {
    const deck = deckOf({ skipped: [cardKey.timeOff("late"), cardKey.timeOff("early")] });
    expect(deck.slice(-2).map((c) => c.key)).toEqual(["time-off:late", "time-off:early"]);
  });

  it("leaves out a card whose answer is held for Undo", () => {
    const deck = deckOf({ held: new Set([writeKey.timeOff("early")]), heldTask: (id) => id === "t-soon" });
    expect(deck.map((c) => c.key)).not.toContain("time-off:early");
    expect(deck.map((c) => c.key)).not.toContain("task:t-soon");
  });

  it("puts a page waiting for the reader's yes among the things to do, by its agree-by date", () => {
    const agreement = partialMock<AgreementRow>({ pageId: "p1", title: "Travel policy", dueOn: "2026-11-14", overdue: false });
    const deck = deckOf({ agreements: [agreement] });
    expect(deck.filter((c) => c.group === "DO").map((c) => c.key)).toEqual(["task:t-soon", "agree:p1", "task:review", "task:t-later"]);
    expect(deck.find((c) => c.kind === "AGREE")).toMatchObject({ key: cardKey.agreement("p1"), agreement });
  });

  it("skipping sends the card last and forgets keys that are no longer in the deck", () => {
    const deck = deckOf();
    expect(skipCard(["gone:1", "time-off:late"], "time-off:early", deck)).toEqual(["time-off:late", "time-off:early"]);
  });
});
