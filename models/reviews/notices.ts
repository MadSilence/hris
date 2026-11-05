import type { CodedMessage } from "@/models/misc";
import type { ReviewsT } from "./i18n";
import { REVIEW_KIND_KEYS, type ReviewKind } from "./index";

/**
 * The sentences reviews compose on the backend — a launch's blockers and warnings, a peer cap passed, a calibration
 * row that is locked — worded here from their codes (`ReviewNotice`, I18N_DESIGN.md rule 1). A code this frontend
 * does not know, or one whose params do not fit, gives null: the caller shows the English the backend sent beside it.
 */

const KINDS = ["SELF", "MANAGER", "PEER", "UPWARD"] as const satisfies readonly ReviewKind[];
const isKind = (v: string | undefined): v is ReviewKind => v != null && (KINDS as readonly string[]).includes(v);

/** A param that must be a number; NaN when it is not, so the caller can refuse it. */
const num = (v: string | undefined): number => (v == null || v.trim() === "" ? NaN : Number(v));

export const reviewNoticeText = (t: ReviewsT, m: CodedMessage | null | undefined): string | null => {
  if (!m) return null;
  const p = m.params ?? {};
  const kind = () => (isKind(p.kind) ? t(REVIEW_KIND_KEYS[p.kind]) : null);
  switch (m.code) {
    case "NO_KINDS": return t("notice.blocker.noKinds");
    case "NOMINATION_DATES_MISSING": return t("notice.blocker.nominationDatesMissing");
    case "APPROVAL_NEEDS_MANAGER_REVIEW": return t("notice.blocker.approvalNeedsManagerReview");
    case "APPROVER_MISSING": return t("notice.blocker.approverMissing");
    case "RELEASE_DATE_MISSING": return t("notice.blocker.releaseDateMissing");
    case "NOBODY_MATCHES": return t("notice.blocker.nobodyMatches");
    case "KIND_NO_FORM": { const k = kind(); return k && t("notice.blocker.kindNoForm", { kind: k }); }
    case "KIND_FORM_ARCHIVED": { const k = kind(); return k && t("notice.blocker.kindFormArchived", { kind: k }); }
    case "KIND_FORM_NO_QUESTION": { const k = kind(); return k && t("notice.blocker.kindFormNoQuestion", { kind: k }); }
    case "KIND_NO_DUE_DATE": { const k = kind(); return k && t("notice.blocker.kindNoDueDate", { kind: k }); }
    case "PERSON_NOT_EMPLOYED": return p.name ? t("notice.blocker.personNotEmployed", { name: p.name }) : null;
    case "PEER_MAX_BELOW_ANONYMITY": {
      const peerMax = num(p.peerMax), threshold = num(p.threshold);
      return Number.isNaN(peerMax) || Number.isNaN(threshold) ? null
        : t("notice.warning.peerMaxBelowAnonymity", { peerMax, threshold });
    }
    case "FEW_REPORTS_FOR_UPWARD": {
      const count = num(p.count), threshold = num(p.threshold);
      return Number.isNaN(count) || Number.isNaN(threshold) ? null
        : t("notice.warning.fewReportsForUpward", { count, threshold });
    }
    case "REVIEWER_CAP_EXCEEDED": {
      const count = num(p.count);
      return !p.name || Number.isNaN(count) ? null : t("notice.peer.reviewerCapExceeded", { name: p.name, count });
    }
    case "LOCKED_REMOVED": return t("notice.locked.removed");
    case "LOCKED_SHARED": return t("notice.locked.shared");
    default: return null;
  }
};

/** The English the backend sent, as a sentence: "the self review has no form" → "The self review has no form." */
export const englishSentence = (s: string): string => `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;

/**
 * Lines with their codes: each coded line worded here, each line whose code is unknown — or every line, when the
 * codes are missing or do not pair one to one — as the English the backend composed.
 */
export const reviewNoticeLines = (
  t: ReviewsT,
  english: readonly string[] | null | undefined,
  codes: readonly CodedMessage[] | null | undefined,
): string[] => {
  const lines = english ?? [];
  const paired = codes != null && codes.length === lines.length;
  return lines.map((line, i) => (paired ? reviewNoticeText(t, codes[i]) : null) ?? englishSentence(line));
};

/**
 * Why a calibration row is read-only, as one sentence; null when it is not locked. Without a known code the English
 * reason goes into the screen's own "Read-only: …" line (`fallback`: the table's or the nine-box card's).
 */
export const lockedText = (
  t: ReviewsT,
  row: { lockedReason: string | null; lockedCode?: CodedMessage | null },
  fallback: "calibration.readOnly" | "nineBox.readOnly" = "calibration.readOnly",
): string | null => {
  if (!row.lockedReason && !row.lockedCode) return null;
  return reviewNoticeText(t, row.lockedCode)
    ?? (row.lockedReason ? t(fallback, { reason: row.lockedReason }) : null);
};
