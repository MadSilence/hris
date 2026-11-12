/**
 * The company hub (COMPANY_HUB_DESIGN.md § 12.2): news, a handbook of pages, and pages people agree to.
 *
 * Every shape mirrors a record of `HubDTOs.java` field by field. Bodies are ProseMirror JSON **in a string**; a
 * `LocalDate` is `yyyy-MM-dd`, an `OffsetDateTime` an ISO string with its offset.
 *
 * `audienceLabel` is machine-readable, not words: `"EVERYONE"`, or the number of people it reaches as a decimal
 * string ("118"). The screen words it through the catalogue (`useAudienceLabel`).
 */
import type { FilterDTO } from "@/models/user/fields";

// ── the audience ────────────────────────────────────────────────────────────────────────────────────
export type HubAudienceMode = "EVERYONE" | "FILTER" | "PEOPLE";

export type HubAudience = {
  mode: HubAudienceMode;
  /** FILTER only: AND-ed, the People filter language. */
  filters: FilterDTO[];
  /** PEOPLE, or FILTER's "Also add". */
  userIds: string[];
  roleIds: string[];
};

export const EVERYONE_AUDIENCE: HubAudience = { mode: "EVERYONE", filters: [], userIds: [], roleIds: [] };

export type AudienceLabel = "EVERYONE" | string;

// ── people ──────────────────────────────────────────────────────────────────────────────────────────
export type PersonRef = { id: string; name: string; jobTitle: string | null; avatarUrl: string | null };

// ── reading: news ───────────────────────────────────────────────────────────────────────────────────
export type PostType = "ANNOUNCEMENT" | "POLICY_UPDATE" | "EVENT";
export type FeedScope = "FOR_ME" | "ALL";

export type PostCard = {
  id: string;
  type: PostType;
  title: string;
  excerpt: string | null;
  coverFileId: string | null;
  author: PersonRef | null;
  publishedAt: string | null;
  eventOn: string | null;
  audienceLabel: AudienceLabel;
  pinned: boolean;
  saved: boolean;
};

export type PostPage = { items: PostCard[]; nextCursor: string | null };

export type Post = {
  id: string;
  type: PostType;
  title: string;
  body: string;
  coverFileId: string | null;
  author: PersonRef | null;
  publishedAt: string | null;
  eventOn: string | null;
  audienceLabel: AudienceLabel;
  pinned: boolean;
  saved: boolean;
};

// ── reading: the handbook ───────────────────────────────────────────────────────────────────────────
export type HandbookPageRow = { id: string; title: string; icon: string | null; waiting: boolean };

export type HandbookSection = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  pageCount: number;
  toAgree: number;
  pages: HandbookPageRow[];
};

export type Handbook = { pageCount: number; sectionCount: number; sections: HandbookSection[] };

export type ReaderRequest = { versionNo: number; dueOn: string; overdue: boolean };
export type ReaderAgreement = { versionNo: number; agreedAt: string };

export type HubPage = {
  id: string;
  sectionId: string | null;
  sectionName: string | null;
  title: string;
  icon: string | null;
  color: string | null;
  body: string;
  readMinutes: number;
  owner: PersonRef | null;
  versionNo: number;
  updatedAt: string | null;
  audienceLabel: AudienceLabel;
  saved: boolean;
  mustRead: boolean;
  revisionId: string | null;
  /** The reader's open request, when this page waits for them. */
  request: ReaderRequest | null;
  /** The reader's latest agreement, to any version. */
  agreement: ReaderAgreement | null;
  whatChanged: string[];
  changedBlockIds: string[];
  preview: boolean;
};

export type AgreeRequest = { revisionId: string };
export type AgreeResult = { versionNo: number; agreedAt: string };

/** CH03: one page waiting for the reader, or one they agreed to. */
export type AgreementRow = {
  pageId: string;
  title: string;
  icon: string | null;
  color: string | null;
  sectionName: string | null;
  versionNo: number;
  /** What the meta line says: never agreed, a newer version of an agreed page, or past its date. */
  what: "NEW" | "CHANGED" | "OVERDUE" | null;
  changesCount: number;
  agreedVersion: number | null;
  previousAgreedAt: string | null;
  dueOn: string | null;
  overdue: boolean;
  agreedAt: string | null;
};

export type MyAgreements = { waiting: AgreementRow[]; agreed: AgreementRow[] };

export type SavedType = "POST" | "PAGE";

export type SavedItem = {
  type: SavedType;
  id: string;
  title: string;
  icon: string | null;
  color: string | null;
  /** The section's name for a page; null for a post ("News"). */
  context: string | null;
  date: string | null;
};

export type SearchHit = { id: string; title: string; context: string | null };
export type HubSearchResult = { pages: SearchHit[]; posts: SearchHit[] };

// ── the hub's home ──────────────────────────────────────────────────────────────────────────────────
export type Waiting = { count: number; nearestDue: string | null };

export type SectionCard = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  pageCount: number;
  toAgree: number;
};

export type RecentPage = { id: string; title: string; sectionName: string | null; updatedAt: string | null };

export type HubCelebrations = { enabled: boolean; birthdays: boolean; anniversaries: boolean; joiners: boolean };

export type HubHome = {
  waiting: Waiting;
  pinned: PostCard | null;
  posts: PostCard[];
  sections: SectionCard[];
  moreSections: number;
  recentlyUpdated: RecentPage[];
  savedCount: number;
  canManage: boolean;
  celebrations: HubCelebrations;
};

// ── managing: posts ─────────────────────────────────────────────────────────────────────────────────
export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";
export type PostStatusFilter = "ALL" | PostStatus;

export type PostWrite = {
  type: PostType;
  title: string;
  body: string;
  coverFileId: string | null;
  audience: HubAudience;
  pinned: boolean | null;
  /** Stored from the start, never shown in v1 (Q-12): always false. */
  showOnHome: boolean | null;
  notifyPeople: boolean | null;
  eventOn: string | null;
};

export type ScheduleRequest = { publishAt: string };

export type ManagePostRow = {
  id: string;
  type: PostType;
  title: string;
  coverFileId: string | null;
  author: PersonRef | null;
  audienceLabel: AudienceLabel;
  status: PostStatus;
  publishAt: string | null;
  publishedAt: string | null;
  createdAt: string | null;
  pinned: boolean;
};

export type PostEdit = {
  id: string;
  type: PostType;
  title: string;
  body: string;
  coverFileId: string | null;
  audience: HubAudience;
  audienceLabel: AudienceLabel;
  audienceCount: number;
  status: PostStatus;
  publishAt: string | null;
  pinned: boolean;
  showOnHome: boolean;
  notifyPeople: boolean;
  eventOn: string | null;
  /** The title of the post pinned now, for "Unpins “{title}”". */
  pinnedElsewhereTitle: string | null;
};

export type Created = { id: string };

// ── managing: the handbook ──────────────────────────────────────────────────────────────────────────
export type SectionWrite = { name: string; icon: string | null; color: string | null; audience: HubAudience | null };

export type ReorderRequest = { sectionId: string | null; ids: string[] };

export type SectionDeleteImpact = { pages: number; mustReadPages: number; openRequests: number };

export type SectionDeleteRequest = { movePagesTo: string | null; deletePages: boolean };

export type PageStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";

export type TreePage = {
  id: string;
  title: string;
  icon: string | null;
  color: string | null;
  owner: PersonRef | null;
  status: PageStatus;
  mustRead: boolean;
  agreed: number;
  needed: number;
  updatedAt: string | null;
};

export type TreeSection = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  position: number;
  audience: HubAudience;
  audienceLabel: AudienceLabel;
  mustReadCount: number;
  pages: TreePage[];
};

export type PageTree = { sectionCount: number; pageCount: number; sections: TreeSection[] };

export type PageCreate = { sectionId: string | null };

/** The editor's view of a page: the draft, its properties, and what is published (CM06). */
export type PageEdit = {
  id: string;
  sectionId: string | null;
  sectionName: string | null;
  title: string;
  icon: string | null;
  color: string | null;
  body: string;
  owner: PersonRef | null;
  audience: HubAudience;
  audienceLabel: AudienceLabel;
  audienceCount: number;
  mustRead: boolean;
  agreeBy: string | null;
  status: PageStatus;
  versionNo: number;
  unpublishedChanges: boolean;
  everAgreed: boolean;
  savedAt: string | null;
  version: number;
};

export type DraftWrite = {
  title: string | null;
  icon: string | null;
  color: string | null;
  body: string | null;
  mustRead: boolean | null;
  agreeBy: string | null;
  expectedVersion: number | null;
};

export type DraftSaved = { savedAt: string; version: number };

export type PagePropsWrite = { sectionId: string | null; ownerUserId: string | null; audience: HubAudience | null };

export type PublishKind = "NEW_VERSION" | "FIX";
export type PublishRequest = { kind: PublishKind; whatChanged: string[]; agreeBy: string | null };
export type Published = { versionNo: number; revisionNo: number };

export type MoveRequest = { sectionId: string; position: number | null };

// ── managing: who agreed ────────────────────────────────────────────────────────────────────────────
export type AgreementTab = "NOT_YET" | "AGREED";

export type LastAgreed = { versionNo: number; at: string };

export type AgreedPerson = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  department: string | null;
  office: string | null;
  lastAgreed: LastAgreed | null;
  remindedAt: string | null;
  agreedAt: string | null;
};

export type WhoAgreed = {
  pageId: string;
  title: string;
  versionNo: number;
  dueOn: string | null;
  agreed: number;
  needed: number;
  notYet: number;
  /** Not yet agreed and not reminded in the last 24 h: who "Remind" would reach now. */
  remindable: number;
  agreedPrevious: number;
  newHires: number;
  rows: AgreedPerson[];
};

export type RemindRequest = { userIds: string[] };
export type Reminded = { reminded: number };

// ── managing: overview ──────────────────────────────────────────────────────────────────────────────
export type OverviewPage = {
  id: string;
  title: string;
  agreed: number;
  needed: number;
  dueOn: string | null;
  pastDeadline: boolean;
  notYet: number;
  /** Not yet agreed and not reminded in the last 24 h: who "Remind" would reach now. */
  remindable: number;
};

export type Overview = {
  postsThisMonth: number;
  postsLastMonth: number;
  drafts: number;
  scheduled: number;
  nearestScheduled: string | null;
  openMustRead: number;
  openAgreed: number;
  openNeeded: number;
  missedPeople: number;
  missedPages: number;
  missedPageTitle: string | null;
  missedPageId: string | null;
  latestPosts: ManagePostRow[];
  mustRead: OverviewPage[];
};

// ── settings ────────────────────────────────────────────────────────────────────────────────────────
export type EditorRole = { id: string; name: string; editableHere: boolean };
export type Editors = { roles: EditorRole[]; people: PersonRef[] };

export type HubSettings = {
  /** 1, 3 or 7; null is "Don't remind". */
  reminderDaysBefore: number | null;
  notifyManagerOnMiss: boolean;
  onboardingTask: boolean;
  celebrations: HubCelebrations;
  editors: Editors;
};

/** A partial save: every field optional. `clearReminder` says "Don't remind" (null cannot). */
export type HubSettingsWrite = Partial<{
  reminderDaysBefore: number;
  clearReminder: boolean;
  notifyManagerOnMiss: boolean;
  onboardingTask: boolean;
  celebrationsEnabled: boolean;
  celebrateBirthdays: boolean;
  celebrateAnniversaries: boolean;
  celebrateJoiners: boolean;
  editorRoleIds: string[];
  editorUserIds: string[];
}>;

// ── the audience dialog ─────────────────────────────────────────────────────────────────────────────
export type AudienceResolveRequest = { audience: HubAudience; q: string | null; limit: number | null };
export type AudienceResolved = { total: number; people: PersonRef[]; label: AudienceLabel };

export type FileUploaded = { id: string };

/** Where a hub image is read from: a session-bound route, never a public URL (design § 6.3). */
export const hubFileUrl = (fileId: string): string => `/api/hub/files/${fileId}`;
