"use client";

import React from "react";
import { formatDisplayDate } from "@/lib/date";
import {
  REVIEW_KIND_LABELS,
  replaceMentions,
  type Answer,
  type AnswersBlock,
  type MentionValues,
  type ScalePoint,
} from "@/models/reviews";

/** One answer as text: a rating with its label, a list of choices, yes or no, a date. */
export function answerText(a: Answer, scale: ScalePoint[]): string {
  const v = a.value;
  if (v === null || v === undefined || v === "") return "—";
  switch (a.type) {
    case "RATING": {
      const point = scale.find((s) => s.value === Number(v));
      return point ? `${point.value} · ${point.label}` : String(v);
    }
    case "YES_NO":
      return v === true ? "Yes" : "No";
    case "MULTIPLE_CHOICE":
      return Array.isArray(v) ? v.join(", ") : String(v);
    case "DATE":
      return formatDisplayDate(String(v), { style: "medium" });
    default:
      return String(v);
  }
}

/**
 * A submitted review, read-only. An anonymous peer review has no author and no date — a date beside "submitted"
 * names its writer as surely as a name (R4).
 */
export function AnswersView({ block, scale, mentions, title }: {
  block: AnswersBlock;
  scale: ScalePoint[];
  /** What the question's `@` tokens stand for (Q2). */
  mentions: MentionValues;
  title?: string;
}) {
  const heading = title ?? (block.kind === "PEER" && !block.author
    ? "Peer Review"
    : `${REVIEW_KIND_LABELS[block.kind]}${block.author ? ` — ${block.author.name}` : ""}`);
  return (
    <section className="space-y-3 rounded-xl border border-brown-100 bg-white p-5" data-test="review-answers">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-base font-semibold text-brown-900">{heading}</h3>
        {block.previous && <span className="text-xs text-muted-foreground">Written by a previous manager</span>}
        {block.submittedAt && (
          <span className="text-xs text-muted-foreground">Submitted {formatDisplayDate(block.submittedAt, { style: "medium" })}</span>
        )}
      </div>
      {block.answers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No answers.</p>
      ) : (
        <dl className="space-y-3">
          {block.answers.map((a) => (
            <div key={a.questionId}>
              <dt className="text-sm font-medium text-brown-900">{replaceMentions(a.label, mentions)}</dt>
              <dd className="mt-0.5 whitespace-pre-line text-sm text-brown-800">{answerText(a, scale)}</dd>
              {a.comment && <dd className="mt-0.5 whitespace-pre-line text-sm text-muted-foreground">{a.comment}</dd>}
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
