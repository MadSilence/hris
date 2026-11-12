import { EVERYONE_AUDIENCE, type HubAudience, type PostEdit, type PostType, type PostWrite } from "@/models/hub";
import { EMPTY_DOC, isEmptyDoc, parseDoc, serializeDoc } from "../../document/doc";

/** What CM05 holds while the author writes. */
export type PostDraft = {
  type: PostType;
  title: string;
  body: string;
  coverFileId: string | null;
  audience: HubAudience;
  pinned: boolean;
  notifyPeople: boolean;
  eventOn: string | null;
};

export const emptyPostDraft = (): PostDraft => ({
  type: "ANNOUNCEMENT",
  title: "",
  body: serializeDoc(EMPTY_DOC),
  coverFileId: null,
  audience: EVERYONE_AUDIENCE,
  pinned: false,
  notifyPeople: false,
  eventOn: null,
});

export const draftFromEdit = (post: PostEdit): PostDraft => ({
  type: post.type,
  title: post.title,
  body: post.body,
  coverFileId: post.coverFileId,
  audience: post.audience,
  pinned: post.pinned,
  notifyPeople: post.notifyPeople,
  eventOn: post.eventOn,
});

/** `showOnHome` is stored from the start and never offered in v1 (Q-12): always false. */
export const toPostWrite = (draft: PostDraft): PostWrite => ({
  type: draft.type,
  title: draft.title.trim(),
  body: draft.body,
  coverFileId: draft.coverFileId,
  audience: draft.audience,
  pinned: draft.pinned,
  showOnHome: false,
  notifyPeople: draft.notifyPeople,
  eventOn: draft.type === "EVENT" ? draft.eventOn : null,
});

export type PostErrors = { title?: "required"; publishAt?: "required" | "past" };

/** CM05's one rule: a title — on Publish, Schedule and Save draft alike ("Add a title"). */
export const validatePost = (draft: PostDraft): PostErrors => (draft.title.trim() ? {} : { title: "required" });

/** A schedule needs a date and a time in the future. */
export const validateSchedule = (date: string, time: string, now: Date = new Date()): PostErrors["publishAt"] | undefined => {
  if (!date || !/^\d{2}:\d{2}$/.test(time)) return "required";
  return new Date(`${date}T${time}:00`).getTime() <= now.getTime() ? "past" : undefined;
};

/** The moment to send: the author's local date and time, as an instant with its offset. */
export const publishAtOf = (date: string, time: string): string => new Date(`${date}T${time}:00`).toISOString();

/** Typed text, a title, a cover — anything the author would lose by closing (CM05 "Discard this post?"). */
export const isPostDirty = (draft: PostDraft, initial: PostDraft): boolean =>
  JSON.stringify({ ...draft, body: isEmptyDoc(parseDoc(draft.body)) ? "" : draft.body }) !==
  JSON.stringify({ ...initial, body: isEmptyDoc(parseDoc(initial.body)) ? "" : initial.body });
