/**
 * Mentions in a review form (DECISIONS.md § "Performance reviews — the second sitting", Q2): a question's text names
 * people with `@` tokens, and every screen that shows a question replaces them through `replaceMentions`. The stored
 * text keeps the tokens. `{subjectFirstName}`, the brace form forms were first written with, still reads as `@subject`.
 * An `@word` that is not a token is left as it is.
 */
import type { ReviewsT } from "./i18n";

export type MentionToken = "subject" | "subjectFullName" | "manager" | "cycle";

/** The tokens in the order the editor offers them, each with what it stands for. */
export const MENTION_TOKENS = [
  { token: "subject", labelKey: "mentions.token.subject" },
  { token: "subjectFullName", labelKey: "mentions.token.subjectFullName" },
  { token: "manager", labelKey: "mentions.token.manager" },
  { token: "cycle", labelKey: "mentions.token.cycle" },
] as const satisfies readonly { token: MentionToken; labelKey: string }[];

/** What each token stands for here — the backend's `mentions`; a missing one reads as a description. */
export type MentionValues = Partial<Record<MentionToken, string | null>>;

const FALLBACK = {
  subject: "mentions.fallback.subject",
  subjectFullName: "mentions.fallback.subject",
  manager: "mentions.fallback.manager",
  cycle: "mentions.fallback.cycle",
} as const satisfies Record<MentionToken, string>;

const LEGACY = "{subjectFirstName}";

// Longest first, so `@subjectFullName` is not read as `@subject` followed by "FullName". Not after a letter, so an
// e-mail address such as hr@subject.com stays as it is.
const TOKEN_PATTERN = /(?<![A-Za-z0-9_])@(subjectFullName|subject|manager|cycle)(?![A-Za-z0-9_])|\{subjectFirstName\}/g;

export type MentionSegment = { text: string; token: MentionToken | null };

/** The text cut into plain runs and tokens, in order — what the editor highlights. */
export function splitMentions(text: string): MentionSegment[] {
  const out: MentionSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN_PATTERN)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: text.slice(last, at), token: null });
    out.push({ text: m[0], token: m[0] === LEGACY ? "subject" : (m[1] as MentionToken) });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), token: null });
  return out;
}

/** Every token replaced by what it stands for; one with no value reads as a description, in the reader's language. */
export function replaceMentions(text: string, values: MentionValues, t: ReviewsT): string {
  return splitMentions(text)
    .map((s) => (s.token ? (values[s.token]?.trim() || t(FALLBACK[s.token])) : s.text))
    .join("");
}

/**
 * The `@word` being typed just before the caret, or null: an `@` at the start or after a character that cannot end
 * a word, followed by letters only.
 */
export function mentionQueryAt(text: string, caret: number): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const m = /(^|[^A-Za-z0-9_@])@([A-Za-z]*)$/.exec(before);
  if (!m) return null;
  return { start: caret - m[2].length - 1, query: m[2] };
}

/** The tokens that start with what was typed after `@`, ignoring case. */
export function mentionOptions(query: string) {
  const q = query.toLowerCase();
  return MENTION_TOKENS.filter((t) => t.token.toLowerCase().startsWith(q));
}

/** The text with the `@word` at `start` (of `length` characters after the `@`) replaced by a whole token. */
export function insertMention(text: string, start: number, length: number, token: MentionToken) {
  const end = start + 1 + length;
  const after = text.slice(end);
  const insert = `@${token}${/^\s/.test(after) ? "" : " "}`;
  return { text: text.slice(0, start) + insert + after, caret: start + insert.length };
}
