import type { TimeOffRequest } from "@/models/timeOff";
import type { Task } from "@/models/lifecycle";
import type { AutomationsWeekRun } from "@/models/home";

/**
 * One card of *Waiting on you* (`home-widgets` § 1). Only the kinds that have a module today (DECISIONS.md § "The home
 * redesign"): leave and its cancellations and an automation's approval to **decide**; tasks and review steps to
 * **do**; for HR, a failed automation run to **read**. A kind is one more source here when its module arrives.
 */
export type DeckCard =
  | { key: string; group: "DECIDE"; kind: "TIME_OFF"; request: TimeOffRequest }
  | { key: string; group: "DECIDE"; kind: "CANCELLATION"; request: TimeOffRequest }
  | { key: string; group: "DECIDE"; kind: "AUTOMATION"; task: Task }
  | { key: string; group: "DO"; kind: "TASK"; task: Task }
  | { key: string; group: "DO"; kind: "REVIEW"; task: Task }
  | { key: string; group: "READ"; kind: "FAILED_RUN"; run: AutomationsWeekRun };

export const REVIEW_KINDS = new Set<Task["kind"]>(["REVIEW", "NOMINATE_PEERS", "APPROVE_PEERS", "APPROVE_REVIEW"]);

/** The key a card is skipped under (`homeSkipped`, Q-5) — a kind and an id. */
export const cardKey = {
  timeOff: (id: string) => `time-off:${id}`,
  task: (id: string) => `task:${id}`,
  run: (id: string) => `run:${id}`,
};

/** The key a held write is kept under in Home's deferred queue — one per card that can be answered on Home. */
export const writeKey = {
  timeOff: (id: string) => `approve-time-off:${id}`,
  automation: (taskId: string) => `approve-automation:${taskId}`,
};

const byDueDate = (a: Task, b: Task) => {
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return a.title.localeCompare(b.title);
};

/**
 * The deck in its order: Decide (oldest first), then Do (by due date), then Read (newest first) — and behind them, in
 * the order they were skipped, the cards this person skipped. A card whose answer is being held for Undo is not in it.
 */
export const buildDeck = (input: {
  requests: TimeOffRequest[];
  tasks: Task[];
  failedRuns: AutomationsWeekRun[];
  skipped: readonly string[];
  held: ReadonlySet<string>;
  /** The held keys of tasks ticked done (My tasks shares them). */
  heldTask: (taskId: string) => boolean;
}): DeckCard[] => {
  const decide: DeckCard[] = [
    ...[...input.requests]
      .filter((r) => !input.held.has(writeKey.timeOff(r.id)))
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
      .map((request): DeckCard =>
        request.status === "CANCELLATION_PENDING"
          ? { key: cardKey.timeOff(request.id), group: "DECIDE", kind: "CANCELLATION", request }
          : { key: cardKey.timeOff(request.id), group: "DECIDE", kind: "TIME_OFF", request },
      ),
    ...input.tasks
      .filter((task) => task.kind === "APPROVE_AUTOMATION" && task.status === "OPEN" && !input.held.has(writeKey.automation(task.id)))
      .sort(byDueDate)
      .map((task): DeckCard => ({ key: cardKey.task(task.id), group: "DECIDE", kind: "AUTOMATION", task })),
  ];
  const doing: DeckCard[] = input.tasks
    .filter((task) => task.kind !== "APPROVE_AUTOMATION" && task.status === "OPEN" && !input.heldTask(task.id))
    .sort(byDueDate)
    .map((task): DeckCard =>
      REVIEW_KINDS.has(task.kind)
        ? { key: cardKey.task(task.id), group: "DO", kind: "REVIEW", task }
        : { key: cardKey.task(task.id), group: "DO", kind: "TASK", task },
    );
  const reading: DeckCard[] = input.failedRuns.map((run): DeckCard => ({ key: cardKey.run(run.id), group: "READ", kind: "FAILED_RUN", run }));

  const all = [...decide, ...doing, ...reading];
  const skippedAt = new Map(input.skipped.map((key, i) => [key, i]));
  const fresh = all.filter((card) => !skippedAt.has(card.key));
  const later = all.filter((card) => skippedAt.has(card.key)).sort((a, b) => (skippedAt.get(a.key) ?? 0) - (skippedAt.get(b.key) ?? 0));
  return [...fresh, ...later];
};

/** The skip order after skipping `key`: it goes last; keys of cards that are no longer in the deck are forgotten. */
export const skipCard = (skipped: readonly string[], key: string, deck: DeckCard[]): string[] => {
  const live = new Set(deck.map((card) => card.key));
  return [...skipped.filter((k) => k !== key && live.has(k)), key];
};
