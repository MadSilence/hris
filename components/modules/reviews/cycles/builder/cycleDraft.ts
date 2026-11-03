import {
  DEFAULT_SCALE,
  REVIEW_KINDS,
  type Cycle,
  type CycleWrite,
  type ReviewApprovalMode,
  type ReviewKind,
  type ReviewPeerMode,
  type ReviewSharingMode,
  type ScalePoint,
} from "@/models/reviews";
import type { FilterDTO } from "@/models/user/fields";

/** One kind of review as the builder holds it: switched on or off, with its form, window and peer limits. */
export type KindDraft = {
  enabled: boolean;
  formId: string | null;
  opensOn: string;
  dueOn: string;
  anonymous: boolean;
  /** Fewer anonymous peer (or upward) reviews in than this and they are held back (Q1). */
  anonymityThreshold: number;
  peerMin: number;
  peerMax: number;
  reviewerCap: number;
  /** PEER only: who chooses the peers, and the two dates when the person nominates (REVIEWS_PLAN.md 10.2). */
  peerMode: ReviewPeerMode;
  nominationDueOn: string;
  approvalDueOn: string;
};

export const ANONYMITY_THRESHOLD_MIN = 2;
export const ANONYMITY_THRESHOLD_MAX = 10;

export type CycleDraft = {
  name: string;
  description: string;
  filters: FilterDTO[];
  eligibleHiredBefore: string;
  scale: ScalePoint[];
  sharingMode: ReviewSharingMode;
  releaseDate: string;
  kinds: Record<ReviewKind, KindDraft>;
  /** Who approves a manager review before it is shared (10.3). */
  approvalMode: ReviewApprovalMode;
  approverUserId: string | null;
  approverName: string | null;
};

const emptyKind = (enabled: boolean): KindDraft => ({
  enabled,
  formId: null,
  opensOn: "",
  dueOn: "",
  anonymous: true,
  anonymityThreshold: 3,
  peerMin: 2,
  peerMax: 4,
  reviewerCap: 6,
  peerMode: "ADMIN_SELECTS",
  nominationDueOn: "",
  approvalDueOn: "",
});

const emptyKinds = (): Record<ReviewKind, KindDraft> =>
  ({ SELF: emptyKind(false), MANAGER: emptyKind(false), PEER: emptyKind(false), UPWARD: emptyKind(false) });

/** A new cycle: self and manager reviews on, peers off, the default scale, the manager shares. */
export const newCycleDraft = (): CycleDraft => ({
  name: "",
  description: "",
  filters: [],
  eligibleHiredBefore: "",
  scale: DEFAULT_SCALE,
  sharingMode: "MANAGER_SHARES",
  releaseDate: "",
  kinds: { ...emptyKinds(), SELF: emptyKind(true), MANAGER: emptyKind(true) },
  approvalMode: "NONE",
  approverUserId: null,
  approverName: null,
});

export function cycleDraftOf(c: Cycle): CycleDraft {
  const draft = newCycleDraft();
  const kinds = emptyKinds();
  for (const k of c.kinds) {
    kinds[k.kind] = {
      enabled: true,
      formId: k.formId,
      opensOn: k.opensOn ?? "",
      dueOn: k.dueOn ?? "",
      anonymous: k.anonymous,
      anonymityThreshold: k.anonymityThreshold ?? draft.kinds.PEER.anonymityThreshold,
      peerMin: k.peerMin ?? draft.kinds.PEER.peerMin,
      peerMax: k.peerMax ?? draft.kinds.PEER.peerMax,
      reviewerCap: k.reviewerCap ?? draft.kinds.PEER.reviewerCap,
      peerMode: k.peerMode ?? "ADMIN_SELECTS",
      nominationDueOn: k.nominationDueOn ?? "",
      approvalDueOn: k.approvalDueOn ?? "",
    };
  }
  return {
    name: c.name,
    description: c.description ?? "",
    filters: c.segment?.filters ?? [],
    eligibleHiredBefore: c.eligibleHiredBefore ?? "",
    scale: c.scale.length ? c.scale : DEFAULT_SCALE,
    sharingMode: c.sharingMode,
    releaseDate: c.releaseDate ?? "",
    kinds,
    approvalMode: c.approvalMode ?? "NONE",
    approverUserId: c.approverUserId ?? null,
    approverName: c.approverName ?? null,
  };
}

export function toCycleWrite(d: CycleDraft, version: number | null): CycleWrite {
  return {
    name: d.name.trim(),
    description: d.description.trim() || null,
    segment: { filters: d.filters, excludeUserIds: [] },
    eligibleHiredBefore: d.eligibleHiredBefore || null,
    scale: d.scale.map((p, i) => ({ value: i + 1, label: p.label.trim(), description: p.description?.trim() || null })),
    sharingMode: d.sharingMode,
    releaseDate: d.sharingMode === "RELEASED_ON_DATE" ? d.releaseDate || null : null,
    ownerUserId: null,
    version,
    approvalMode: d.approvalMode,
    approverUserId: d.approvalMode === "PERSON" ? d.approverUserId : null,
    kinds: REVIEW_KINDS.filter((k) => d.kinds[k].enabled).map((k) => {
      const kd = d.kinds[k];
      return {
        kind: k,
        formId: kd.formId,
        opensOn: kd.opensOn || null,
        dueOn: kd.dueOn || null,
        ...(k === "PEER"
          ? {
            anonymous: kd.anonymous, anonymityThreshold: kd.anonymityThreshold, peerMin: kd.peerMin, peerMax: kd.peerMax,
            reviewerCap: kd.reviewerCap, peerMode: kd.peerMode,
            ...(kd.peerMode === "SUBJECT_NOMINATES"
              ? { nominationDueOn: kd.nominationDueOn || null, approvalDueOn: kd.approvalDueOn || null }
              : {}),
          }
          : {}),
        // An upward review is always anonymous; only its threshold is chosen (10.1).
        ...(k === "UPWARD" ? { anonymous: true, anonymityThreshold: kd.anonymityThreshold } : {}),
      };
    }),
  };
}

export const sameCycleDraft = (a: CycleDraft, b: CycleDraft) =>
  JSON.stringify(toCycleWrite(a, null)) === JSON.stringify(toCycleWrite(b, null));

/** What stops a save before it is sent — the backend checks the same and has the last word. */
export function draftProblems(d: CycleDraft): string[] {
  const problems: string[] = [];
  if (!d.name.trim()) problems.push("Give the cycle a name.");
  for (const k of REVIEW_KINDS) {
    const kd = d.kinds[k];
    if (kd.enabled && kd.opensOn && kd.dueOn && kd.dueOn < kd.opensOn) problems.push("A review is due before it opens.");
  }
  if (d.scale.some((p) => !p.label.trim())) problems.push("Every point of the rating scale needs a label.");
  const peer = d.kinds.PEER;
  if (peer.enabled && (peer.peerMin < 1 || peer.peerMax < peer.peerMin)) {
    problems.push("Peers per person: at least one, and the least no more than the most.");
  }
  const upward = d.kinds.UPWARD;
  const thresholdOff = (t: number) => t < ANONYMITY_THRESHOLD_MIN || t > ANONYMITY_THRESHOLD_MAX;
  if ((peer.enabled && peer.anonymous && thresholdOff(peer.anonymityThreshold))
    || (upward.enabled && thresholdOff(upward.anonymityThreshold))) {
    problems.push(`The anonymity threshold runs from ${ANONYMITY_THRESHOLD_MIN} to ${ANONYMITY_THRESHOLD_MAX}.`);
  }
  if (peer.enabled && peer.peerMode === "SUBJECT_NOMINATES") {
    if (peer.nominationDueOn && peer.approvalDueOn && peer.approvalDueOn < peer.nominationDueOn) {
      problems.push("Peers are approved before they are nominated.");
    }
    if (peer.approvalDueOn && peer.dueOn && peer.dueOn < peer.approvalDueOn) {
      problems.push("The peer review is due before its peers are approved.");
    }
  }
  if (d.approvalMode !== "NONE" && !d.kinds.MANAGER.enabled) {
    problems.push("An approval of the manager review needs a manager review.");
  }
  return Array.from(new Set(problems));
}
