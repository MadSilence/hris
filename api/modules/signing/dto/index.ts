import type { DocumentDTO } from "@/api/modules/documents/dto";

/** One signer of a signing, as the sender, the person's documents and the signers read it. A guest's token never leaves the server. */
export type EnvelopeSignerDTO = {
  id: string;
  /** 1–20; the same number signs at the same time, a lower one first. */
  order: number;
  /** "Employee", "Employer" — from the template; null for a plain PDF (Q-31). */
  label: string | null;
  userId: string | null;
  name: string;
  /** Hidden from other signers on a guest's page. */
  email: string | null;
  isGuest: boolean;
  status: "WAITING" | "PENDING" | "SIGNED" | "DECLINED";
  pendingSince: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
};

export type EnvelopeStatus = "SENT" | "COMPLETED" | "DECLINED" | "CANCELLED" | "EXPIRED";

/** A document out for signature — "a signing" on every screen. */
export type EnvelopeDTO = {
  id: string;
  title: string;
  status: EnvelopeStatus;
  subjectUserId: string | null;
  sourceDocumentId: string | null;
  signedDocumentId: string | null;
  templateId: string | null;
  documentHash: string | null;
  sentBy: string | null;
  sentAt: string;
  /** The due date: the signing expires then. */
  expiresAt: string;
  completedAt: string | null;
  closedAt: string | null;
  closeReason: string | null;
  signers: EnvelopeSignerDTO[];
  /** Who sent it, by name — on a signer's own screen. */
  sentByName?: string | null;
  /** Which of the signers the reader is — on a signer's own screen. */
  youSignerId?: string | null;
};

/** Who signs, in steps (S02–S05): a person in the company, or a guest by name and email. */
export type SignerInput = {
  key?: string | null;
  userId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  /** The step: the same number signs at the same time. */
  order: number;
  label?: string | null;
};

export type SendForSignatureRequest = {
  /** A PDF already in the person's Documents… */
  documentId?: string | null;
  /** …or a template made for the person on the spot. */
  templateId?: string | null;
  userId?: string | null;
  title?: string | null;
  signers?: SignerInput[];
};

/** S13: a document's signing history across all its signings, oldest first. */
export type SigningHistoryEvent = {
  kind: "SENT" | "SENT_AGAIN" | "SIGNED" | "DECLINED" | "CANCELLED" | "EXPIRED" | "COMPLETED";
  at: string;
  who: string | null;
  guest: boolean;
  comment: string | null;
  envelopeId: string;
};

/** What a guest's link opens (G09): the signing, which of its signers they are, and whose colours. */
export type GuestSigningView = {
  envelope: EnvelopeDTO;
  signerId: string;
  companyName: string | null;
};

/** The phone hand-off (G03d): a one-time link, ten minutes. */
export type DrawingLink = { token: string; expiresAt: string };

/** The phone's drawing once it is sent (G03e), as a PNG data URL; null while there is none. */
export type DrawingPickup = { drawing: string | null; at: string | null };

/** The phone page (G03f): for which document, whose signature, in whose colours. */
export type DrawingHolder = { title: string; signerName: string; companyName: string | null; subdomain: string | null };

/** How a signer signs (G03): the name typed (set in Marck Script), or drawn — a PNG data URL. */
export type SignatureSubmission = { code: string; signedName: string; browserToken: string; drawing?: string | null };

// ── the Documents sidebar item (D01–D04) ──────────────────────────────────────────────────────────────────────────

export type SectionSort = "NAME" | "PERSON" | "CATEGORY" | "EXPIRES" | "UPLOADED";

export type SectionDocumentRow = { document: DocumentDTO; personId: string; personName: string };

export type SectionDocumentsPage = { rows: SectionDocumentRow[]; total: number };

export type SectionDocumentsQuery = {
  q?: string;
  personIds?: string[];
  categoryIds?: string[];
  sort?: SectionSort;
  asc?: boolean;
  offset?: number;
  size?: number;
};

export type SectionSigningRow = { envelope: EnvelopeDTO; personName: string; categoryId: string | null };

export type DocumentRequestStatus = "WAITING" | "OVERDUE" | "UPLOADED";

export type DocumentRequestRow = {
  taskId: string;
  title: string;
  categoryId: string | null;
  personId: string;
  personName: string;
  uploaderId: string | null;
  uploaderName: string | null;
  askedById: string | null;
  askedByName: string | null;
  dueDate: string | null;
  status: DocumentRequestStatus;
  uploadedAt: string | null;
  documentId: string | null;
};

export type SectionCounts = { all: number; expiring: number; signing: number; requests: number };

export type ExpiringRow = { document: DocumentDTO; personId: string; personName: string };

// ── requests (R02–R10) ───────────────────────────────────────────────────────────────────────────────────────────

export type DocumentRequestPayload = {
  userIds?: string[];
  segment?: unknown;
  categoryId?: string | null;
  title?: string | null;
  note?: string | null;
  dueDate?: string | null;
  /** Someone else uploads it for the person (R03); only for one person. */
  uploaderId?: string | null;
  /** The folder of the document it replaces. */
  folderId?: string | null;
};

export type DocumentRequestResult = {
  taskIds: string[];
  skipped: { userId: string; reason: "NOT_FOUND" | "DRAFT" | "NO_ACCESS" | string }[];
};
export * from "./party";

/** One signer a template asks for (DOCUMENTS_DESIGN.md § 5.3). */
export type TemplateSigner = {
  key: string;
  kind: "PERSON" | "MANAGER" | "USER" | "GUEST";
  userId?: string | null;
  order?: number | null;
  label?: string | null;
};

/** A document template as Settings, the profile and the automations read it (§ 12). */
export type DocumentTemplateDTO = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  fields: string[];
  signers: TemplateSigner[];
  requiresQes: boolean;
  envelopeExpiryDays: number;
  isActive: boolean;
  version: number | null;
  problems: string[];
  draftBody: string | null;
  currentVersion: number | null;
  draftAhead: boolean;
  draftUpdatedAt: string | null;
  draftProblems: string[];
};
