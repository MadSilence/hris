import type { ActionSpec, ReviewWindowSpec } from "@/models/automations";
import { REVIEW_KINDS, type Cycle, type ReviewKind } from "@/models/reviews";
import type { AutomationsT } from "@/components/modules/automations/shared/vocabulary";

/** The words a problem is told in: the automations catalogue, and a review kind's name (the reviews catalogue's). */
export type StartReviewWords = { t: AutomationsT; kindLabel: (kind: ReviewKind) => string };

/** How long a review stays open when a template is first chosen: due two weeks after it opens. */
export const DEFAULT_WINDOW_DAYS = 14;

/**
 * The windows a "Start a Review" action begins with when its template is chosen (REVIEWS_PLAN.md 11.3): every kind
 * the template asks opens on the step's own day and is due two weeks later; the author moves them from there.
 */
export function defaultReviewWindows(kinds: readonly ReviewKind[], offsetDays: number): ReviewWindowSpec[] {
  return REVIEW_KINDS.filter((k) => kinds.includes(k))
    .map((kind) => ({ kind, opensOffsetDays: offsetDays, dueOffsetDays: offsetDays + DEFAULT_WINDOW_DAYS }));
}

/** One window of the action, edited in place; a kind with no window yet gets one. */
export function withWindow(windows: ReviewWindowSpec[] | null | undefined, kind: ReviewKind,
  patch: Partial<ReviewWindowSpec>): ReviewWindowSpec[] {
  const list = windows ?? [];
  const found = list.some((w) => w.kind === kind);
  const next = found ? list.map((w) => (w.kind === kind ? { ...w, ...patch } : w)) : [...list, { kind, ...patch }];
  return REVIEW_KINDS.flatMap((k) => next.filter((w) => w.kind === k));
}

/**
 * What stops a "Start a Review" action, in words, before the preview asks the server — which checks the same and has
 * the last word. With the template loaded, its kinds, nominated peers and release date are checked too.
 */
export function startReviewProblems(action: ActionSpec, template: Cycle | null | undefined, words: StartReviewWords): string[] {
  const { t } = words;
  const label = (kind: ReviewKind) => words.kindLabel(kind).toLowerCase();
  const problems: string[] = [];
  if (!action.templateCycleId) return [t("startReview.problem.chooseTemplate")];
  const windows = action.reviewWindows ?? [];
  for (const w of windows) {
    if (w.dueOffsetDays == null) problems.push(t("startReview.problem.noDue", { kind: label(w.kind) }));
    else if (w.opensOffsetDays != null && w.dueOffsetDays < w.opensOffsetDays) {
      problems.push(t("startReview.problem.dueBeforeOpens", { kind: label(w.kind) }));
    }
    if (w.nominationOffsetDays != null && w.approvalOffsetDays != null && w.approvalOffsetDays < w.nominationOffsetDays) {
      problems.push(t("startReview.problem.peersOrder"));
    }
  }
  if (template) {
    for (const k of template.kinds) {
      const w = windows.find((x) => x.kind === k.kind);
      if (!w) problems.push(t("startReview.problem.setWindow", { kind: label(k.kind) }));
      else if (k.peerMode === "SUBJECT_NOMINATES" && (w.nominationOffsetDays == null || w.approvalOffsetDays == null)) {
        problems.push(t("startReview.problem.peerDates"));
      }
    }
    for (const w of windows) {
      if (!template.kinds.some((k) => k.kind === w.kind)) problems.push(t("startReview.problem.notInTemplate", { kind: label(w.kind) }));
    }
    if (template.sharingMode === "RELEASED_ON_DATE" && action.releaseOffsetDays == null) {
      problems.push(t("startReview.problem.releaseDate"));
    }
  }
  return Array.from(new Set(problems));
}
