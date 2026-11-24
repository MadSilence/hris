import type { TimeOffRequest } from "@/models/timeOff";
import type { Task } from "@/models/lifecycle";
import type { AutomationsWeekRun } from "@/models/home";
import type { AgreementRow } from "@/models/hub";
import type { EnvelopeDTO } from "@/api/modules/signing/dto";

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
  /** A must-read page waiting for the reader's yes (COMPANY_HUB_DESIGN.md U3): read on its page, never agreed here. */
  | { key: string; group: "DO"; kind: "AGREE"; agreement: AgreementRow }
  /** A document to sign that no task stands for — sent from a profile (A1); signing opens its screen. */
  | { key: string; group: "DO"; kind: "SIGN"; envelope: EnvelopeDTO }
  | { key: string; group: "READ"; kind: "FAILED_RUN"; run: AutomationsWeekRun };

export const REVIEW_KINDS = new Set<Task["kind"]>(["REVIEW", "NOMINATE_PEERS", "APPROVE_PEERS", "APPROVE_REVIEW"]);

/** The key a card is skipped under (`homeSkipped`, Q-5) — a kind and an id. */
export const cardKey = {
  timeOff: (id: string) => `time-off:${id}`,
  task: (id: string) => `task:${id}`,
  run: (id: string) => `run:${id}`,
  agreement: (pageId: string) => `agree:${pageId}`,
  envelope: (id: string) => `sign:${id}`,
};

/**
 * The key a card is **read** under — a failed run's *Mark as read* (the owner, 2026-11-19, widgets W13): the run
 * leaves that person's deck for good. It is kept in the same `homeSkipped` list as the skip order, as
 * `read-run:<id>`, so it needs no storage of its own; the list's own cap lets the oldest fall off.
 */
export const readKey = (key: string) => `read-${key}`;
const isReadKey = (key: string) => key.startsWith("read-");

/**
 * The line under a must-read page's name (W15, WALK_QUESTIONS § 42): "was updated" only for a page the person agreed
 * to an earlier version of (`what` CHANGED, or OVERDUE — which the API sends only for such a page); a page they never
 * agreed to (`what` NEW) is one "to read and agree".
 */
export const agreementLineKey = (agreement: Pick<AgreementRow, "what" | "agreedVersion">): "wasUpdated" | null =>
  agreement.what === "NEW" || agreement.agreedVersion == null ? null : "wasUpdated";

const byDueDate = (a: Task, b: Task) => {
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return a.title.localeCompare(b.title);
};

/** A Do card's date: a task's due date, a page's agree-by, a signing's last day. None sorts last. */
const dueOf = (card: DeckCard): string | null =>
  card.kind === "AGREE"
    ? card.agreement.dueOn
    : card.kind === "SIGN"
      ? card.envelope.expiresAt?.slice(0, 10) ?? null
      : card.kind === "TASK" || card.kind === "REVIEW"
        ? card.task.dueDate
        : null;

/** Two lists already in due order, merged into one; on the same day the task comes first. */
const mergeByDue = (tasks: DeckCard[], agreements: DeckCard[]): DeckCard[] => {
  const out: DeckCard[] = [];
  let i = 0;
  let j = 0;
  while (i < tasks.length || j < agreements.length) {
    if (j >= agreements.length) out.push(tasks[i++]);
    else if (i >= tasks.length) out.push(agreements[j++]);
    else out.push((dueOf(agreements[j]) ?? "9999") < (dueOf(tasks[i]) ?? "9999") ? agreements[j++] : tasks[i++]);
  }
  return out;
};

/**
 * The deck in its order: Decide (oldest first), then Do (by due date), then Read (newest first) — and behind them, in
 * the order they were skipped, the cards this person skipped. A card whose answer is held for Undo is not in it: the
 * server leaves it out of the reader's lists while it is held (DECISIONS.md § "Undo and the Admin role", U-4).
 */
export const buildDeck = (input: {
  requests: TimeOffRequest[];
  tasks: Task[];
  failedRuns: AutomationsWeekRun[];
  /** The hub's pages waiting for the reader's yes (`GET /hub/agreements`, its `waiting` list). */
  agreements?: AgreementRow[];
  /** Documents to sign that no task stands for (`/me/actions`, its `envelopes`). */
  envelopes?: EnvelopeDTO[];
  skipped: readonly string[];
}): DeckCard[] => {
  const decide: DeckCard[] = [
    ...[...input.requests]
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
      .map((request): DeckCard =>
        request.status === "CANCELLATION_PENDING"
          ? { key: cardKey.timeOff(request.id), group: "DECIDE", kind: "CANCELLATION", request }
          : { key: cardKey.timeOff(request.id), group: "DECIDE", kind: "TIME_OFF", request },
      ),
    ...input.tasks
      .filter((task) => task.kind === "APPROVE_AUTOMATION" && task.status === "OPEN")
      .sort(byDueDate)
      .map((task): DeckCard => ({ key: cardKey.task(task.id), group: "DECIDE", kind: "AUTOMATION", task })),
  ];
  const taskCards: DeckCard[] = input.tasks
    .filter((task) => task.kind !== "APPROVE_AUTOMATION" && task.status === "OPEN")
    .sort(byDueDate)
    .map((task): DeckCard =>
      REVIEW_KINDS.has(task.kind)
        ? { key: cardKey.task(task.id), group: "DO", kind: "REVIEW", task }
        : { key: cardKey.task(task.id), group: "DO", kind: "TASK", task },
    );
  const agreeCards: DeckCard[] = [...(input.agreements ?? [])]
    .sort((a, b) => (a.dueOn ?? "9999").localeCompare(b.dueOn ?? "9999"))
    .map((agreement): DeckCard => ({ key: cardKey.agreement(agreement.pageId), group: "DO", kind: "AGREE", agreement }));
  const signCards: DeckCard[] = [...(input.envelopes ?? [])]
    .map((envelope): DeckCard => ({ key: cardKey.envelope(envelope.id), group: "DO", kind: "SIGN", envelope }))
    .sort((a, b) => (dueOf(a) ?? "9999").localeCompare(dueOf(b) ?? "9999"));
  const doing = mergeByDue(mergeByDue(taskCards, agreeCards), signCards);
  const read = new Set(input.skipped.filter(isReadKey));
  const reading: DeckCard[] = input.failedRuns.filter((run) => !read.has(readKey(cardKey.run(run.id)))).map((run): DeckCard => ({ key: cardKey.run(run.id), group: "READ", kind: "FAILED_RUN", run }));

  const all = [...decide, ...doing, ...reading];
  const skippedAt = new Map(input.skipped.filter((key) => !isReadKey(key)).map((key, i) => [key, i]));
  const fresh = all.filter((card) => !skippedAt.has(card.key));
  const later = all.filter((card) => skippedAt.has(card.key)).sort((a, b) => (skippedAt.get(a.key) ?? 0) - (skippedAt.get(b.key) ?? 0));
  return [...fresh, ...later];
};

/**
 * The skip order after skipping `key`: it goes last; keys of cards that are no longer in the deck are forgotten. What
 * was marked as read is kept — its card is out of the deck because it was read.
 */
export const skipCard = (skipped: readonly string[], key: string, deck: DeckCard[]): string[] => {
  const live = new Set(deck.map((card) => card.key));
  return [...skipped.filter((k) => isReadKey(k) || (k !== key && live.has(k))), key];
};

/** The list after marking `key` as read: its skip goes, its read mark is added. */
export const markRead = (skipped: readonly string[], key: string): string[] => [
  ...skipped.filter((k) => k !== key && k !== readKey(key)),
  readKey(key),
];
