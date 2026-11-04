"use client";

import React from "react";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import { Textarea } from "@/components/desact/textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { PREVIEW_RATING_SCALE, replaceMentions, type MentionValues, type ReviewQuestion } from "@/models/reviews";

/** How the editor shows the mentions a reviewer will see filled in with real names (Q2). */
const SAMPLE: MentionValues = { subject: "Anna", subjectFullName: "Anna weber", manager: "Sam", cycle: "Annual review" };

const withSample = (text: string) => replaceMentions(text, SAMPLE);

/**
 * The form as a reviewer will see it, with nothing that can be answered. A rating is drawn on a
 * five-point scale; a cycle will bring its own (REVIEWS_DESIGN.md § 4.2).
 */
export function FormPreview({ name, description, questions }: {
  name: string;
  description: string;
  questions: ReviewQuestion[];
}) {
  let number = 0;
  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-card border border-divider bg-card p-6 sm:p-8">
      <div className="space-y-1">
        <h2 className="text-section-title text-primary">{name.trim() || "Untitled form"}</h2>
        {description.trim() && <p className="whitespace-pre-line text-body text-tertiary">{withSample(description.trim())}</p>}
        <p className="text-hint text-tertiary">
          Shown as a reviewer writing about {SAMPLE.subjectFullName}, managed by {SAMPLE.manager}, in {SAMPLE.cycle} would see it.
        </p>
      </div>

      {questions.length === 0 ? (
        <p className="text-body text-tertiary">This form has no questions yet.</p>
      ) : (
        <ol className="space-y-6">
          {questions.map((q) => {
            if (q.type === "SECTION") {
              return (
                <li key={q.id} className="space-y-1 border-t border-divider pt-5 first:border-t-0 first:pt-0">
                  <h3 className="text-body font-semibold text-primary">{withSample(q.label) || "Untitled section"}</h3>
                  {q.description?.trim() && <p className="whitespace-pre-line text-body text-tertiary">{withSample(q.description)}</p>}
                </li>
              );
            }
            number += 1;
            return (
              <li key={q.id} className="space-y-2">
                <div>
                  <p className="text-body font-medium text-primary">
                    {number}. {withSample(q.label) || "Untitled question"}
                    {q.required && <span className="ml-0.5 text-tertiary">*</span>}
                  </p>
                  {q.description?.trim() && (
                    <p className="mt-0.5 whitespace-pre-line text-hint text-tertiary">{withSample(q.description)}</p>
                  )}
                </div>
                <Answer question={q} />
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function Answer({ question: q }: { question: ReviewQuestion }) {
  const label = `Answer to ${q.label || "the question"}`;
  switch (q.type) {
    case "RATING":
      return (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-5" role="radiogroup" aria-label={label}>
            {PREVIEW_RATING_SCALE.map((point, i) => (
              <div key={point} className="rounded-control border border-divider px-2 py-2 text-center text-hint text-tertiary">
                <div className="text-body font-semibold text-primary">{i + 1}</div>
                {point}
              </div>
            ))}
          </div>
          <Textarea rows={2} disabled aria-label={`Comment on ${q.label || "the rating"}`} />
        </div>
      );
    case "LONG_TEXT":
      return <Textarea rows={4} disabled aria-label={label} />;
    case "SHORT_TEXT":
    case "NUMBER":
      return <Input disabled aria-label={label} className="max-w-sm" />;
    case "DATE":
      return <DatePicker value="" onChange={() => undefined} disabled ariaLabel={label} className="max-w-xs" />;
    case "YES_NO":
      return <Choices options={["Yes", "No"]} round />;
    case "SINGLE_CHOICE":
      return <Choices options={(q.options ?? []).filter((o) => o.trim())} round />;
    case "MULTIPLE_CHOICE":
      return <Choices options={(q.options ?? []).filter((o) => o.trim())} />;
    default:
      return null;
  }
}

function Choices({ options, round }: { options: string[]; round?: boolean }) {
  if (options.length === 0) return <p className="text-hint text-tertiary">No options yet.</p>;
  return (
    <ul className="space-y-1.5">
      {options.map((o) => (
        <li key={o} className="flex items-center gap-2 text-body text-primary">
          {round ? <span className="h-4 w-4 rounded-pill border border-field" aria-hidden /> : <Checkbox disabled />}
          {o}
        </li>
      ))}
    </ul>
  );
}
