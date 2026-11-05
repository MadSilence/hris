"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, ArrowDown02Icon, ArrowUp02Icon, Cancel01Icon, Copy01Icon, Delete02Icon, Heading01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/desact/select";
import { cn } from "@/lib/cn";
import {
  isChoiceQuestion,
  REVIEW_QUESTION_TYPE_KEYS,
  type ReviewQuestion,
  type ReviewQuestionType,
} from "@/models/reviews";
import { retype } from "./draft";
import { MentionField } from "./MentionField";
import { FormError } from "@/components/feedback/FormError";

type Props = {
  question: ReviewQuestion;
  /** Its number among the entries that ask something; a section has none. */
  number: number | null;
  first: boolean;
  last: boolean;
  readOnly: boolean;
  problem?: string;
  onChange: (q: ReviewQuestion) => void;
  onOverallChange: (on: boolean) => void;
  onMove: (by: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
};

/**
 * One entry of a review form: a question, or a section heading that groups the questions under it. The
 * text is what the reviewer reads; an `@` token in it — `@subject`, `@manager`… — becomes a name (Q2).
 */
export function QuestionCard({
  question: q, number, first, last, readOnly, problem, onChange, onOverallChange, onMove, onDuplicate, onRemove,
}: Props) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const section = q.type === "SECTION";
  const [showGuidance, setShowGuidance] = useState(Boolean(q.description));
  const idBase = `q-${q.id}`;

  return (
    <li
      data-test="review-question"
      className={cn(
        "rounded-card border bg-card p-4",
        section ? "border-divider bg-subtle/40" : "border-divider",
        problem && "border-danger/50",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-2 w-6 shrink-0 text-right text-body font-medium text-tertiary">
          {section ? <Icon icon={Heading01Icon} size="sm" className="ml-auto" label={t("editor.question.section")} /> : `${number}.`}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex-1 space-y-1">
              <MentionField
                id={`${idBase}-label`}
                value={q.label}
                disabled={readOnly}
                aria-label={section ? t("editor.question.sectionHeading") : t("editor.question.question", { number: number ?? 0 })}
                aria-invalid={problem ? true : undefined}
                className={cn(section && "font-medium")}
                onChange={(label) => onChange({ ...q, label })}
              />
            </div>
            {!section && (
              <Select
                value={q.type}
                disabled={readOnly}
                onValueChange={(v) => onChange(retype(q, v as ReviewQuestionType))}
              >
                <SelectTrigger id={`${idBase}-type`} aria-label={t("editor.question.answerType")} className="sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(REVIEW_QUESTION_TYPE_KEYS) as (keyof typeof REVIEW_QUESTION_TYPE_KEYS)[]).map((type) => (
                    <SelectItem key={type} value={type}>{t(REVIEW_QUESTION_TYPE_KEYS[type])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {showGuidance && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={`${idBase}-guidance`} className="text-hint text-tertiary">
                  {section ? t("editor.question.textUnderHeading") : t("editor.question.guidance")}
                </Label>
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={section ? t("editor.question.removeText") : t("editor.question.removeGuidance")}
                    title={section ? t("editor.question.removeText") : t("editor.question.removeGuidance")}
                    className="rounded-control p-0.5 text-tertiary hover:bg-subtle hover:text-primary"
                    onClick={() => {
                      setShowGuidance(false);
                      onChange({ ...q, description: null });
                    }}
                  >
                    <Icon icon={Cancel01Icon} size="sm" />
                  </button>
                )}
              </div>
              <MentionField
                id={`${idBase}-guidance`}
                multiline
                rows={2}
                value={q.description ?? ""}
                disabled={readOnly}
                onChange={(description) => onChange({ ...q, description })}
              />
            </div>
          )}

          {isChoiceQuestion(q.type) && (
            <OptionCells
              options={q.options ?? []}
              disabled={readOnly}
              onChange={(options) => onChange({ ...q, options })}
            />
          )}

          {q.type === "RATING" && (
            <p className="text-hint text-tertiary">
              {t("editor.question.ratingHint")}
            </p>
          )}

          {problem && <FormError message={problem} />}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {!section && (
              <label className="flex items-center gap-1.5 text-body">
                <Checkbox
                  checked={Boolean(q.required)}
                  disabled={readOnly}
                  onCheckedChange={(c) => onChange({ ...q, required: c === true })}
                />
                {tCommon("fields.required")}
              </label>
            )}
            {q.type === "RATING" && (
              <label className="flex items-center gap-1.5 text-body" title={t("editor.question.overallHint")}>
                <Checkbox
                  checked={Boolean(q.overall)}
                  disabled={readOnly}
                  onCheckedChange={(c) => onOverallChange(c === true)}
                />
                {t("packet.overallRating")}
              </label>
            )}
            {!readOnly && !showGuidance && (
              <button
                type="button"
                className="text-body font-medium text-secondary hover:text-primary"
                onClick={() => setShowGuidance(true)}
              >
                {section ? t("editor.question.addText") : t("editor.question.addGuidance")}
              </button>
            )}

            {!readOnly && (
              <div className="ml-auto flex gap-1">
                <IconButton label={t("editor.question.moveUp")} disabled={first} onClick={() => onMove(-1)}><Icon icon={ArrowUp02Icon} size="sm" /></IconButton>
                <IconButton label={t("editor.question.moveDown")} disabled={last} onClick={() => onMove(1)}><Icon icon={ArrowDown02Icon} size="sm" /></IconButton>
                <IconButton label={tCommon("actions.duplicate")} onClick={onDuplicate}><Icon icon={Copy01Icon} size="sm" /></IconButton>
                <IconButton label={tCommon("actions.remove")} onClick={onRemove}><Icon icon={Delete02Icon} size="sm" /></IconButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function IconButton({ label, disabled, onClick, children }: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={label} title={label}
      disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

/** A choice's options, each in a cell of its own, with a cell to add the next. Empty ones are dropped on save. */
function OptionCells({ options, disabled, onChange }: {
  options: string[];
  disabled?: boolean;
  onChange: (options: string[]) => void;
}) {
  const t = useTranslations("reviews");
  const shown = options.length ? options : [""];
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("editor.question.options")}>
      {shown.map((o, i) => (
        <div key={i} className="relative">
          <Input
            aria-label={t("editor.question.option", { number: i + 1 })}
            value={o}
            disabled={disabled}
            className="h-8 w-40 pr-7 text-body"
            onChange={(e) => onChange(shown.map((x, j) => (j === i ? e.target.value : x)))}
          />
          {!disabled && shown.length > 1 && (
            <button type="button" aria-label={t("editor.question.removeOption", { number: i + 1 })}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-control p-0.5 text-tertiary hover:text-primary"
              onClick={() => onChange(shown.filter((_, j) => j !== i))}>
              <Icon icon={Cancel01Icon} size="sm" />
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="ghost" size="sm" className="gap-1 text-secondary" onClick={() => onChange([...shown, ""])}>
          <Icon icon={Add01Icon} size="sm" />
          {t("editor.question.addOption")}
        </Button>
      )}
    </div>
  );
}
