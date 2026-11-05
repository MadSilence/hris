"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, ArrowDown02Icon, ArrowUp02Icon, Cancel01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/desact/select";
import type { Question, QuestionType } from "@/models/lifecycle";

const QUESTION_TYPES: QuestionType[] = ["SHORT_TEXT", "LONG_TEXT", "NUMBER", "DATE", "YES_NO", "SINGLE_CHOICE", "MULTIPLE_CHOICE"];

const isChoice = (t: QuestionType) => t === "SINGLE_CHOICE" || t === "MULTIPLE_CHOICE";

/** A question's id is a UUID the backend keeps: an answer names its question by it. */
const newId = () => crypto.randomUUID();

/**
 * A questionnaire's questions, defined on the task itself (DECISIONS.md § "Lifecycle tasks", A5). Each keeps
 * the id it was given here across saves, so an answer can say which question it answered. A choice lists its
 * options one per line.
 */
export function QuestionsEditor({ idPrefix, questions, disabled, onChange }: {
  idPrefix: string;
  questions: Question[];
  disabled?: boolean;
  onChange: (questions: Question[]) => void;
}) {
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const patch = (i: number, p: Partial<Question>) => onChange(questions.map((q, j) => (j === i ? { ...q, ...p } : q)));
  const move = (i: number, by: number) => {
    const next = [...questions];
    const [q] = next.splice(i, 1);
    next.splice(i + by, 0, q);
    onChange(next);
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-body font-medium">{t("questions.legend")}</legend>
      {questions.length === 0 && <p className="text-hint text-tertiary">{t("questions.empty")}</p>}
      <ol className="divide-y divide-divider">
        {questions.map((q, i) => (
          <li key={q.id} className="space-y-2 py-3 first:pt-0">
            <Input
              aria-label={t("questions.question", { number: i + 1 })}
              placeholder={t("questions.question", { number: i + 1 })}
              value={q.label}
              disabled={disabled}
              onChange={(e) => patch(i, { label: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Select value={q.type} disabled={disabled}
                onValueChange={(v) => patch(i, { type: v as QuestionType, options: isChoice(v as QuestionType) ? q.options ?? [] : null })}>
                <SelectTrigger
                  // i18n-exempt: an element id
                  id={`${idPrefix}-q${i}-type`}
                  aria-label={t("questions.answerType")}
                  className="flex-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{t(`questionType.${type}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-1.5 text-hint">
                <Checkbox checked={Boolean(q.required)} disabled={disabled} onCheckedChange={(c) => patch(i, { required: c === true })} />
                {tCommon("fields.required")}
              </label>
            </div>
            {isChoice(q.type) && (
              <OptionCells
                options={q.options ?? []}
                disabled={disabled}
                onChange={(options) => patch(i, { options })}
              />
            )}
            {!disabled && (
              <div className="flex justify-end gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={t("questions.moveUp")} disabled={i === 0} onClick={() => move(i, -1)}>
                  <Icon icon={ArrowUp02Icon} size="sm" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={t("questions.moveDown")} disabled={i === questions.length - 1} onClick={() => move(i, 1)}>
                  <Icon icon={ArrowDown02Icon} size="sm" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={t("questions.remove")}
                  onClick={() => onChange(questions.filter((_, j) => j !== i))}>
                  <Icon icon={Delete02Icon} size="sm" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {!disabled && (
        <Button type="button" size="sm" variant="secondary" className="gap-1.5"
          onClick={() => onChange([...questions, { id: newId(), label: "", type: "SHORT_TEXT", required: false }])}>
          <Icon icon={Add01Icon} size="sm" />
          {t("questions.add")}
        </Button>
      )}
      <p className="text-hint text-tertiary">{t("questions.hint")}</p>
    </fieldset>
  );
}

/**
 * A choice's options, each in a cell of its own beside the others — not lines of one box — with a cell to add
 * the next. Empty cells are left out when the question is saved.
 */
function OptionCells({ options, disabled, onChange }: {
  options: string[];
  disabled?: boolean;
  onChange: (options: string[]) => void;
}) {
  const t = useTranslations("lifecycle");
  const shown = options.length ? options : [""];
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("questions.options")}>
      {shown.map((o, i) => (
        <div key={i} className="relative">
          <Input
            aria-label={t("questions.option", { number: i + 1 })}
            placeholder={t("questions.option", { number: i + 1 })}
            value={o}
            disabled={disabled}
            className="h-8 w-32 pr-7 text-body"
            onChange={(e) => onChange(shown.map((x, j) => (j === i ? e.target.value : x)))}
          />
          {!disabled && shown.length > 1 && (
            <button type="button" aria-label={t("questions.removeOption", { number: i + 1 })}
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
          {t("questions.addOption")}
        </Button>
      )}
    </div>
  );
}
