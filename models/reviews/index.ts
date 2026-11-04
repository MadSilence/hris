/**
 * Performance reviews (technical_design/REVIEWS_DESIGN.md; the owner's answers DECISIONS.md § "Performance reviews"):
 * forms, cycles with self, manager, peer and upward reviews, peers nominated by the person reviewed, the approval of
 * the manager review, writing them, and the packets they make.
 */
import type { FilterDTO } from "@/models/user/fields";
import type { MentionValues } from "./mentions";

export * from "./mentions";
export * from "./steps";
export * from "./calibration";

// ── forms ─────────────────────────────────────────────────────────────────────────────────

/** The lifecycle questionnaire's answer types, plus a rating and a section heading (design § 4.1). */
export type ReviewQuestionType =
  | "SECTION"
  | "RATING"
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "DATE"
  | "YES_NO"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE";

/**
 * One entry of a form. Its id is a UUID chosen in the editor and kept across saves: an answer names its
 * question by it.
 */
export type ReviewQuestion = {
  id: string;
  type: ReviewQuestionType;
  label: string;
  /** Guidance under the label; for a section, the text under its heading. */
  description?: string | null;
  options?: string[] | null;
  /** Never set on a section — a section asks nothing. */
  required?: boolean | null;
  /** A rating that is the form's overall rating; at most one per form (design § 6.4). */
  overall?: boolean | null;
};

export type ReviewFormSummary = {
  id: string;
  name: string;
  description: string | null;
  /** The entries that ask something; section headings are not counted. */
  questionCount: number;
  archivedAt: string | null;
  updatedAt: string;
};

export type ReviewForm = {
  id: string;
  name: string;
  description: string | null;
  questions: ReviewQuestion[];
  archivedAt: string | null;
  updatedAt: string;
  version: number;
};

export type ReviewFormWrite = {
  name: string;
  description: string | null;
  questions: ReviewQuestion[];
  /** The version the editor was opened with; a stale one is refused (E00409). */
  version?: number | null;
};

/** What a reviewer answers with, in the order the editor offers them. A section is offered apart. */
export const REVIEW_QUESTION_TYPE_LABELS: Record<Exclude<ReviewQuestionType, "SECTION">, string> = {
  RATING: "Rating",
  LONG_TEXT: "Long text",
  SHORT_TEXT: "Short text",
  SINGLE_CHOICE: "One choice",
  MULTIPLE_CHOICE: "Several choices",
  YES_NO: "Yes or no",
  NUMBER: "Number",
  DATE: "Date",
};

export const isChoiceQuestion = (type: ReviewQuestionType) => type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";

/**
 * The scale a rating is shown on in the form editor's preview, and the one a new cycle starts with — each cycle
 * may change its own (design § 4.2, REVIEWS_PLAN.md A1).
 */
export const PREVIEW_RATING_SCALE = [
  "Well below expectations",
  "Below expectations",
  "Meets expectations",
  "Above expectations",
  "Exceptional",
];

// ── cycles ────────────────────────────────────────────────────────────────────────────────

/** UPWARD: a manager reviewed by their direct reports, always anonymous (REVIEWS_PLAN.md 10.1, reversing R3). */
export type ReviewKind = "SELF" | "MANAGER" | "PEER" | "UPWARD";
export type ReviewCycleStatus = "DRAFT" | "ACTIVE" | "CLOSED";
export type ReviewSharingMode = "MANAGER_SHARES" | "RELEASED_ON_DATE";
/** AWAITING_APPROVAL: the manager review is in and waits for its approver (10.3). */
export type ReviewParticipantStatus = "COLLECTING" | "AWAITING_APPROVAL" | "SHARED" | "ACKNOWLEDGED" | "REMOVED";
/** NOMINATED: a peer the person nominated, not approved yet (10.2). */
export type ReviewAssignmentStatus = "NOMINATED" | "OPEN" | "SUBMITTED" | "DECLINED" | "REASSIGNED" | "CANCELLED";
/** Who chooses the peers: whoever runs the cycle, or the person reviewed with their manager's approval (10.2). */
export type ReviewPeerMode = "ADMIN_SELECTS" | "SUBJECT_NOMINATES";
/** Who approves a manager review before it is shared (10.3). */
export type ReviewApprovalMode = "NONE" | "SKIP_LEVEL" | "PERSON";
export type ReviewNominationStatus = "NOMINATING" | "AWAITING_APPROVAL" | "APPROVED";

export const REVIEW_KINDS: ReviewKind[] = ["SELF", "MANAGER", "PEER", "UPWARD"];

export const REVIEW_KIND_LABELS: Record<ReviewKind, string> = {
  SELF: "Self review",
  MANAGER: "Manager review",
  PEER: "Peer review",
  UPWARD: "Upward review",
};

export const REVIEW_KIND_DESCRIPTIONS: Record<ReviewKind, string> = {
  SELF: "Each person reviews themselves.",
  MANAGER: "Each person's manager reviews them. This review carries the rating.",
  PEER: "Colleagues review the person — chosen after launch, or nominated by the person.",
  UPWARD: "Each person who manages people is reviewed by their direct reports. Always anonymous.",
};

export const REVIEW_PEER_MODE_LABELS: Record<ReviewPeerMode, string> = {
  ADMIN_SELECTS: "Whoever runs the cycle chooses",
  SUBJECT_NOMINATES: "The person nominates, their manager approves",
};

export const REVIEW_APPROVAL_MODE_LABELS: Record<ReviewApprovalMode, string> = {
  NONE: "No approval",
  SKIP_LEVEL: "The manager's manager",
  PERSON: "A named person",
};

export const REVIEW_NOMINATION_STATUS_LABELS: Record<ReviewNominationStatus, string> = {
  NOMINATING: "Nominating",
  AWAITING_APPROVAL: "Awaiting approval",
  APPROVED: "Approved",
};

export const REVIEW_CYCLE_STATUS_LABELS: Record<ReviewCycleStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

export const REVIEW_ASSIGNMENT_STATUS_LABELS: Record<ReviewAssignmentStatus, string> = {
  NOMINATED: "Nominated",
  OPEN: "Not submitted",
  SUBMITTED: "Submitted",
  DECLINED: "Declined",
  REASSIGNED: "Handed on",
  CANCELLED: "Withdrawn",
};

export const REVIEW_PARTICIPANT_STATUS_LABELS: Record<ReviewParticipantStatus, string> = {
  COLLECTING: "Collecting",
  AWAITING_APPROVAL: "Awaiting approval",
  SHARED: "Shared",
  ACKNOWLEDGED: "Acknowledged",
  REMOVED: "Removed",
};

export const REVIEW_SHARING_LABEL: Record<ReviewSharingMode, string> = {
  MANAGER_SHARES: "The manager shares",
  RELEASED_ON_DATE: "Released on a date",
};

export type ScalePoint = { value: number; label: string; description?: string | null };

export const DEFAULT_SCALE: ScalePoint[] = PREVIEW_RATING_SCALE.map((label, i) => ({ value: i + 1, label }));

export type PersonRef = { userId: string; name: string };

export type SegmentDTO = {
  filters: FilterDTO[];
  excludeUserIds: string[];
  includeInactive?: boolean;
  drafts?: string | null;
  q?: string | null;
};

export type KindWrite = {
  kind: ReviewKind;
  formId: string | null;
  opensOn: string | null;
  dueOn: string | null;
  anonymous?: boolean | null;
  /** PEER and UPWARD: fewer anonymous reviews of the kind in than this and they are held back (Q1); 2–10, default 3. */
  anonymityThreshold?: number | null;
  peerMin?: number | null;
  peerMax?: number | null;
  reviewerCap?: number | null;
  /** PEER only (10.2). */
  peerMode?: ReviewPeerMode | null;
  nominationDueOn?: string | null;
  approvalDueOn?: string | null;
};

export type CycleWrite = {
  name: string;
  description: string | null;
  segment: SegmentDTO;
  eligibleHiredBefore: string | null;
  scale: ScalePoint[];
  sharingMode: ReviewSharingMode;
  releaseDate: string | null;
  ownerUserId: string | null;
  kinds: KindWrite[];
  version?: number | null;
  approvalMode: ReviewApprovalMode;
  /** PERSON only. */
  approverUserId: string | null;
};

export type CycleKind = {
  kind: ReviewKind;
  formId: string | null;
  formName: string | null;
  formArchived: boolean;
  questionCount: number;
  opensOn: string | null;
  dueOn: string | null;
  anonymous: boolean;
  anonymityThreshold: number | null;
  peerMin: number | null;
  peerMax: number | null;
  reviewerCap: number | null;
  peerMode: ReviewPeerMode | null;
  nominationDueOn: string | null;
  approvalDueOn: string | null;
};

export type Cycle = {
  id: string;
  name: string;
  description: string | null;
  status: ReviewCycleStatus;
  segment: SegmentDTO;
  eligibleHiredBefore: string | null;
  scale: ScalePoint[];
  sharingMode: ReviewSharingMode;
  releaseDate: string | null;
  ownerUserId: string | null;
  ownerName: string | null;
  kinds: CycleKind[];
  launchedAt: string | null;
  releasedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  version: number;
  approvalMode: ReviewApprovalMode;
  approverUserId: string | null;
  approverName: string | null;
  /** A draft kept to start cycles from (REVIEWS_PLAN.md 11.2): never launched, listed apart. */
  template: boolean;
};

/** A colleague the Nominate Peers page can name: what the picker shows, nothing more (11.0). */
export type Colleague = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export type CycleSummary = {
  id: string;
  name: string;
  status: ReviewCycleStatus;
  kinds: ReviewKind[];
  participants: number;
  assignments: number;
  submitted: number;
  overdue: number;
  nextDueOn: string | null;
  ownerName: string | null;
  launchedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  template: boolean;
};

export type LaunchPreview = {
  participants: number;
  sample: PersonRef[];
  excludedByHireDate: number;
  selfReviews: number;
  managerReviews: number;
  blockers: string[];
  noManager: PersonRef[];
  /** What does not stop the launch but should be known first, in words. */
  warnings: string[];
  /** One per active direct report of every participant who manages somebody (10.1). */
  upwardReviews: number;
  /** Managers with fewer reports than the upward threshold: their upward reviews will be held back. */
  fewReports: PersonRef[];
  /** People asked to nominate their peers (10.2). */
  nominations: number;
};

// ── running a cycle ──────────────────────────────────────────────────────────────────────

export type AssignmentRow = {
  id: string;
  participantId: string;
  kind: ReviewKind;
  reviewer: PersonRef;
  status: ReviewAssignmentStatus;
  reason: string | null;
  dueOn: string | null;
  overdue: boolean;
  submittedAt: string | null;
  nudgedAt: string | null;
};

export type PersonRow = {
  participantId: string;
  subject: PersonRef;
  manager: PersonRef | null;
  managerChanged: boolean;
  currentManager: PersonRef | null;
  leftCompany: boolean;
  status: ReviewParticipantStatus;
  managerReviewIn: boolean;
  shared: boolean;
  acknowledgedAt: string | null;
  finalRating: number | null;
  peers: number;
  peerMin: number | null;
  peerMax: number | null;
  nominationStatus: ReviewNominationStatus | null;
  /** Nominated and not approved yet. */
  nominatedPeers: number;
  upwardReviews: number;
  /** Who approves the manager review, once it was submitted (10.3). */
  approver: PersonRef | null;
  approvedAt: string | null;
  /** A calibration session changed the final rating (12.1); for result readers only. */
  calibrated: boolean;
};

export type ReviewerRow = {
  reviewer: PersonRef;
  total: number;
  submitted: number;
  overdue: number;
  peerReviews: number;
  nearestDueOn: string | null;
  leftCompany: boolean;
};

export type CycleOverview = {
  cycle: Cycle;
  people: PersonRow[];
  reviewers: ReviewerRow[];
  assignments: AssignmentRow[];
  canReadResults: boolean;
};

export type PeersResult = { added: AssignmentRow[]; warnings: string[] };

// ── writing and reading ──────────────────────────────────────────────────────────────────

/** A value as typed: a rating's point, a text, a number, a date, yes/no, an option or several. */
export type AnswerValue = number | string | boolean | string[] | null;

export type AnswerInput = { questionId: string; value: AnswerValue; comment?: string | null };

export type Answer = { questionId: string; label: string; type: ReviewQuestionType; value: AnswerValue; comment: string | null };

export type AnswersBlock = {
  assignmentId: string;
  kind: ReviewKind;
  /** Null for an anonymous peer review — nobody sees its author (R4). */
  author: PersonRef | null;
  submittedAt: string | null;
  previous: boolean;
  answers: Answer[];
};

export type FormCopy = { name: string; description: string | null; questions: ReviewQuestion[] };

export type MyAssignment = {
  id: string;
  kind: ReviewKind;
  status: ReviewAssignmentStatus;
  cycleId: string;
  cycleName: string;
  subject: PersonRef;
  dueOn: string | null;
  overdue: boolean;
  submittedAt: string | null;
};

export type PacketSummary = {
  participantId: string;
  cycleId: string;
  cycleName: string;
  status: ReviewParticipantStatus;
  shared: boolean;
  sharedAt: string | null;
  acknowledgedAt: string | null;
  finalRating: number | null;
  finalRatingLabel: string | null;
};

export type TeamRow = {
  participantId: string;
  cycleId: string;
  cycleName: string;
  cycleStatus: ReviewCycleStatus;
  subject: PersonRef;
  selfStatus: ReviewAssignmentStatus | null;
  managerStatus: ReviewAssignmentStatus | null;
  managerAssignmentId: string | null;
  peersSubmitted: number;
  peersTotal: number;
  packetStatus: ReviewParticipantStatus;
  shared: boolean;
  sharingMode: ReviewSharingMode;
  releaseDate: string | null;
};

/** A step of a review waiting for me — the open task of nominating peers, approving them, approving a review. */
export type ReviewStepKind = "NOMINATE_PEERS" | "APPROVE_PEERS" | "APPROVE_REVIEW";

export type StepRow = {
  kind: ReviewStepKind;
  participantId: string;
  cycleId: string;
  cycleName: string;
  subject: PersonRef;
  dueOn: string | null;
  overdue: boolean;
};

export type MyReviews = {
  toWrite: MyAssignment[];
  written: MyAssignment[];
  aboutMe: PacketSummary[];
  team: TeamRow[];
  steps: StepRow[];
};

/** A person's nomination of their peers (10.2), as its reader may see it. */
export type Nomination = {
  participantId: string;
  cycleId: string;
  cycleName: string;
  subject: PersonRef;
  manager: PersonRef | null;
  approver: PersonRef | null;
  status: ReviewNominationStatus;
  nominationDueOn: string | null;
  approvalDueOn: string | null;
  peerMin: number;
  peerMax: number;
  /** Nominated while it waits; the peers asked once approved — hidden from the person under anonymity. */
  peers: PersonRef[];
  peersAsked: number;
  /** Who cannot be chosen: the person and their manager. */
  excluded: string[];
  nominatedAt: string | null;
  approvedAt: string | null;
  /** Nobody approved by the approval date and the nominations stood (A7). */
  autoApproved: boolean;
  canNominate: boolean;
  canApprove: boolean;
};

export type Writing = {
  id: string;
  kind: ReviewKind;
  status: ReviewAssignmentStatus;
  cycleId: string;
  cycleName: string;
  cycleStatus: ReviewCycleStatus;
  subject: PersonRef;
  opensOn: string | null;
  dueOn: string | null;
  form: FormCopy | null;
  scale: ScalePoint[];
  draft: AnswerInput[];
  submitted: Answer[];
  submittedAt: string | null;
  anonymous: boolean;
  canAmend: boolean;
  canDecline: boolean;
  context: AnswersBlock[];
  /** Anonymous peer reviews in but not sent: fewer than the threshold (Q1). */
  peersHeldBack: number;
  anonymityThreshold: number | null;
  mentions: MentionValues;
  /** Upward reviews of the person in but not sent: fewer than their threshold (A6). */
  upwardHeldBack: number;
  upwardThreshold: number | null;
  /** A manager review its approver sent back: what should change (10.3). */
  sentBackComment: string | null;
};

export type Packet = {
  participantId: string;
  cycleId: string;
  cycleName: string;
  subject: PersonRef;
  manager: PersonRef | null;
  status: ReviewParticipantStatus;
  sharingMode: ReviewSharingMode;
  releaseDate: string | null;
  shared: boolean;
  sharedAt: string | null;
  amendedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgementComment: string | null;
  finalRating: number | null;
  scale: ScalePoint[];
  self: AnswersBlock | null;
  managerReview: AnswersBlock | null;
  peers: AnswersBlock[];
  /** Anonymous peer reviews in but not sent: fewer than the threshold (Q1). */
  peersHeldBack: number;
  anonymityThreshold: number | null;
  mentions: MentionValues;
  canShare: boolean;
  canAcknowledge: boolean;
  /** Upward reviews of the person, anonymous; empty while fewer than the threshold are in (A6). */
  upward: AnswersBlock[];
  upwardHeldBack: number;
  upwardThreshold: number | null;
  approvalMode: ReviewApprovalMode;
  /** Not for the person reviewed. */
  approver: PersonRef | null;
  approvedAt: string | null;
  canApprove: boolean;
  /** How calibration changed the final rating (12.1); never for the person reviewed (A26). */
  calibration: PacketCalibration | null;
  /** From calibration (12.2); not for the person reviewed. */
  potential: ReviewPotential | null;
};

export type PacketCalibration = {
  /** What the manager review says, which the final rating replaced. */
  managerRating: number | null;
  reason: string | null;
  by: PersonRef | null;
  at: string | null;
};

// Calibration and the 9-box (REVIEWS_PLAN.md 12.1–12.2)

export type ReviewPotential = "LOW" | "MEDIUM" | "HIGH";
export const REVIEW_POTENTIALS: ReviewPotential[] = ["LOW", "MEDIUM", "HIGH"];
export const REVIEW_POTENTIAL_LABELS: Record<ReviewPotential, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export type ReviewCalibrationStatus = "OPEN" | "CLOSED";
export const REVIEW_CALIBRATION_STATUS_LABELS: Record<ReviewCalibrationStatus, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
};

export type CalibrationSummary = {
  id: string;
  cycleId: string;
  name: string;
  status: ReviewCalibrationStatus;
  people: number;
  /** People whose rating was changed in this session. */
  calibrated: number;
  createdByName: string | null;
  createdAt: string;
  closedAt: string | null;
};

export type CalibrationRow = {
  participantId: string;
  subject: PersonRef;
  department: string | null;
  manager: PersonRef | null;
  status: ReviewParticipantStatus;
  managerReviewIn: boolean;
  managerRating: number | null;
  finalRating: number | null;
  potential: ReviewPotential | null;
  calibrated: boolean;
  calibrationReason: string | null;
  calibratedBy: PersonRef | null;
  calibratedAt: string | null;
  shared: boolean;
  /** Rating and potential can change here (A8: not once shared). */
  editable: boolean;
  /** Why not, while the session is open. */
  lockedReason: string | null;
};

export type CalibrationSession = {
  id: string;
  cycleId: string;
  cycleName: string;
  cycleStatus: ReviewCycleStatus;
  name: string;
  status: ReviewCalibrationStatus;
  segment: SegmentDTO;
  scale: ScalePoint[];
  rows: CalibrationRow[];
  /** People in the session whose results the reader may not read: counted, not shown. */
  hidden: number;
  canEdit: boolean;
  createdByName: string | null;
  createdAt: string;
  closedAt: string | null;
};

// Results (REVIEWS_PLAN.md 12.3)

export type KindCompletion = { kind: ReviewKind; total: number; submitted: number; overdue: number };
export type DepartmentCompletion = { department: string; people: number; total: number; submitted: number; shared: number };
/** Final ratings per point of the scale, in the scale's order. */
export type RatingDistribution = { label: string | null; counts: number[]; rated: number; average: number | null };
export type ManagerRatings = {
  manager: PersonRef;
  people: number;
  rated: number;
  averageManagerRating: number | null;
  averageFinalRating: number | null;
};

export type CycleResults = {
  people: number;
  byKind: KindCompletion[];
  byDepartment: DepartmentCompletion[];
  scale: ScalePoint[];
  /** People whose results the reader may not read: left out of every rating figure (A25). */
  ratingsHidden: number;
  overall: RatingDistribution;
  ratingsByDepartment: RatingDistribution[];
  byManager: ManagerRatings[];
};
