"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { formatDisplayDate, useDisplayLanguage } from "@/lib/date";
import {
  REVIEW_KIND_KEYS,
  replaceMentions,
  type Answer,
  type CommonT,
  type AnswersBlock,
  type MentionValues,
  type ScalePoint,
} from "@/models/reviews";

/** One answer as text: a rating with its label, a list of choices, yes or no, a date. */
export function answerText(a: Answer, scale: ScalePoint[], tCommon: CommonT, language?: string): string {
  const v = a.value;
  if (v === null || v === undefined || v === "") return "—";
  switch (a.type) {
    case "RATING": {
      const point = scale.find((s) => s.value === Number(v));
      return point ? `${point.value} · ${point.label}` : String(v);
    }
    case "YES_NO":
      return v === true ? tCommon("values.yes") : tCommon("values.no");
    case "MULTIPLE_CHOICE":
      return Array.isArray(v) ? v.join(", ") : String(v);
    case "DATE":
      return formatDisplayDate(String(v), { style: "medium", language });
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
  const t = useTranslations("reviews");
  const language = useDisplayLanguage();
  const tCommon = useTranslations("common");
  const kind = t(REVIEW_KIND_KEYS[block.kind]);
  const heading = title ?? (block.author ? t("answers.headingWithAuthor", { kind, author: block.author.name }) : kind);
  return (
    <section className="space-y-3 rounded-card border border-divider bg-card p-5" data-test="review-answers">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-body font-semibold text-primary">{heading}</h3>
        {block.previous && <span className="text-hint text-tertiary">{t("answers.previousManager")}</span>}
        {block.submittedAt && (
          <span className="text-hint text-tertiary">{t("answers.submitted", { date: formatDisplayDate(block.submittedAt, { style: "medium", language }) })}</span>
        )}
      </div>
      {block.answers.length === 0 ? (
        <p className="text-body text-tertiary">{t("answers.none")}</p>
      ) : (
        <dl className="space-y-3">
          {block.answers.map((a) => (
            <div key={a.questionId}>
              <dt className="text-body font-medium text-primary">{replaceMentions(a.label, mentions, t)}</dt>
              <dd className="mt-0.5 whitespace-pre-line text-body text-primary">{answerText(a, scale, tCommon, language)}</dd>
              {a.comment && <dd className="mt-0.5 whitespace-pre-line text-body text-tertiary">{a.comment}</dd>}
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
