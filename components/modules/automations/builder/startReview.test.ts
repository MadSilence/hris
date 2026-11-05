import type { ActionSpec } from "@/models/automations";
import { REVIEW_KIND_KEYS, type Cycle } from "@/models/reviews";
import type { useTranslations } from "next-intl";
import { translatorFor } from "@/test/nextIntl";
import type { AutomationsT } from "@/components/modules/automations/shared/vocabulary";
import { defaultReviewWindows, startReviewProblems as problemsOf, withWindow, type StartReviewWords } from "./startReview";

const tReviews = translatorFor("reviews") as unknown as ReturnType<typeof useTranslations<"reviews">>;
const words: StartReviewWords = {
  t: translatorFor("automations") as unknown as AutomationsT,
  kindLabel: (kind) => tReviews(REVIEW_KIND_KEYS[kind]),
};
const startReviewProblems = (action: ActionSpec, template?: Cycle | null) => problemsOf(action, template, words);

const template = (patch: Partial<Cycle> = {}): Cycle => ({
  id: "t1",
  name: "Probation review",
  description: null,
  status: "DRAFT",
  segment: { filters: [], excludeUserIds: [] },
  eligibleHiredBefore: null,
  scale: [],
  sharingMode: "MANAGER_SHARES",
  releaseDate: null,
  ownerUserId: null,
  ownerName: null,
  kinds: [
    { kind: "SELF", formId: "f1", formName: "Self", formArchived: false, questionCount: 2, opensOn: null, dueOn: null,
      anonymous: false, anonymityThreshold: null, peerMin: null, peerMax: null, reviewerCap: null, peerMode: null,
      nominationDueOn: null, approvalDueOn: null },
    { kind: "MANAGER", formId: "f1", formName: "Manager", formArchived: false, questionCount: 2, opensOn: null, dueOn: null,
      anonymous: false, anonymityThreshold: null, peerMin: null, peerMax: null, reviewerCap: null, peerMode: null,
      nominationDueOn: null, approvalDueOn: null },
  ],
  launchedAt: null,
  releasedAt: null,
  closedAt: null,
  createdAt: "2026-11-03T10:00:00",
  version: 0,
  approvalMode: "NONE",
  approverUserId: null,
  approverName: null,
  template: true,
  ...patch,
});

const action = (patch: Partial<ActionSpec> = {}): ActionSpec => ({
  type: "START_REVIEW",
  offsetDays: 76,
  templateCycleId: "t1",
  reviewWindows: [
    { kind: "SELF", opensOffsetDays: 76, dueOffsetDays: 90 },
    { kind: "MANAGER", opensOffsetDays: 76, dueOffsetDays: 90 },
  ],
  releaseOffsetDays: null,
  ...patch,
});

describe("start a review", () => {
  it("opens every kind of the chosen template on the step's day, due two weeks later, in the kinds' order", () => {
    expect(defaultReviewWindows(["MANAGER", "SELF"], 90)).toEqual([
      { kind: "SELF", opensOffsetDays: 90, dueOffsetDays: 104 },
      { kind: "MANAGER", opensOffsetDays: 90, dueOffsetDays: 104 },
    ]);
  });

  it("edits one window in place and adds a missing one", () => {
    const windows = withWindow([{ kind: "MANAGER", dueOffsetDays: 90 }], "SELF", { dueOffsetDays: 80 });
    expect(windows).toEqual([{ kind: "SELF", dueOffsetDays: 80 }, { kind: "MANAGER", dueOffsetDays: 90 }]);
    expect(withWindow(windows, "MANAGER", { dueOffsetDays: 95 })[1]).toEqual({ kind: "MANAGER", dueOffsetDays: 95 });
  });

  it("is complete with a template and a due date for each of its kinds", () => {
    expect(startReviewProblems(action(), template())).toEqual([]);
  });

  it("asks for the template first", () => {
    expect(startReviewProblems(action({ templateCycleId: null }))).toEqual(["Choose the review template."]);
  });

  it("refuses a window due before it opens, or with no due date", () => {
    expect(startReviewProblems(action({ reviewWindows: [
      { kind: "SELF", opensOffsetDays: 90, dueOffsetDays: 80 },
      { kind: "MANAGER", opensOffsetDays: 76, dueOffsetDays: null },
    ] }))).toEqual(["The self review is due before it opens.", "Say when the manager review is due."]);
  });

  it("checks the windows against the template's kinds, nominated peers and release date", () => {
    const nominating = template({
      sharingMode: "RELEASED_ON_DATE",
      kinds: [...template().kinds.slice(0, 1), { ...template().kinds[0], kind: "PEER", peerMode: "SUBJECT_NOMINATES" }],
    });
    expect(startReviewProblems(action({ reviewWindows: [
      { kind: "SELF", dueOffsetDays: 90 },
      { kind: "PEER", dueOffsetDays: 90, nominationOffsetDays: 80 },
      { kind: "UPWARD", dueOffsetDays: 90 },
    ] }), nominating)).toEqual([
      "Say when peers are nominated and approved.",
      "The template asks no upward review.",
      "The template releases its results on a date: say when.",
    ]);
    expect(startReviewProblems(action({ reviewWindows: [{ kind: "SELF", dueOffsetDays: 90 }] }), template()))
      .toEqual(["Set the window of the manager review."]);
  });
});
