import { isChoiceQuestion, type ReviewForm, type ReviewsT, type ReviewFormWrite, type ReviewQuestion, type ReviewQuestionType } from "@/models/reviews";

/** What the editor holds between saves. */
export type Draft = {
  name: string;
  description: string;
  questions: ReviewQuestion[];
};

/** A question's id is a UUID the backend keeps: an answer will name its question by it. */
const newId = () => crypto.randomUUID();

export const draftOf = (form: ReviewForm): Draft => ({
  name: form.name,
  description: form.description ?? "",
  questions: form.questions.map((q) => ({ ...q, options: q.options ?? null })),
});

export function newQuestion(type: ReviewQuestionType): ReviewQuestion {
  if (type === "SECTION") return { id: newId(), type, label: "", description: null };
  return {
    id: newId(),
    type,
    label: "",
    description: null,
    options: isChoiceQuestion(type) ? ["", ""] : null,
    required: type === "RATING",
    overall: null,
  };
}

/**
 * A new type keeps what still means something: the text and the guidance always, the options only for a
 * choice, the overall mark only for a rating. A section asks nothing, so it is never required.
 */
export function retype(q: ReviewQuestion, type: ReviewQuestionType): ReviewQuestion {
  return {
    ...q,
    type,
    options: isChoiceQuestion(type) ? (q.options?.length ? q.options : ["", ""]) : null,
    required: type === "SECTION" ? null : Boolean(q.required),
    overall: type === "RATING" ? q.overall ?? null : null,
  };
}

/** The same entry under a new id, placed right after the original. */
export const copyOf = (q: ReviewQuestion): ReviewQuestion => ({ ...q, id: newId(), overall: null });

export function move<T>(list: T[], from: number, by: number): T[] {
  const to = from + by;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Marking one rating as the overall one unmarks any other: a form has at most one. */
export const markOverall = (questions: ReviewQuestion[], id: string, on: boolean): ReviewQuestion[] =>
  questions.map((q) => (q.type !== "RATING" ? q : { ...q, overall: q.id === id ? (on ? true : null) : null }));

/**
 * What would stop a save, per entry, in the words shown under it. The backend checks the same and has the
 * last word; this only saves a round trip and points at the entry.
 */
export function problemsOf(questions: ReviewQuestion[], t: ReviewsT): Record<string, string> {
  const problems: Record<string, string> = {};
  for (const q of questions) {
    if (!q.label.trim()) {
      problems[q.id] = q.type === "SECTION" ? t("editor.problem.sectionHeading") : t("editor.problem.question");
    } else if (isChoiceQuestion(q.type) && new Set((q.options ?? []).map((o) => o.trim()).filter(Boolean)).size < 2) {
      problems[q.id] = t("editor.problem.options");
    }
  }
  return problems;
}

/** The body a save sends: trimmed text, no empty options, nothing a section does not carry. */
export function toWrite(draft: Draft, version: number | null): ReviewFormWrite {
  return {
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    version,
    questions: draft.questions.map((q) => ({
      id: q.id,
      type: q.type,
      label: q.label.trim(),
      description: q.description?.trim() || null,
      options: isChoiceQuestion(q.type) ? (q.options ?? []).map((o) => o.trim()).filter(Boolean) : null,
      required: q.type === "SECTION" ? null : Boolean(q.required),
      overall: q.type === "RATING" && q.overall ? true : null,
    })),
  };
}

/** Whether two drafts would save the same form — what "unsaved changes" means. */
export const sameDraft = (a: Draft, b: Draft) =>
  JSON.stringify(toWrite(a, null)) === JSON.stringify(toWrite(b, null));
