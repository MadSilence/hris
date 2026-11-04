"use client";

import React from "react";
import { Add01Icon, ArrowDown02Icon, ArrowUp02Icon, Cancel01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/desact/select";
import { QUESTION_TYPE_LABELS, type Question, type QuestionType } from "@/models/lifecycle";

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
  const patch = (i: number, p: Partial<Question>) => onChange(questions.map((q, j) => (j === i ? { ...q, ...p } : q)));
  const move = (i: number, by: number) => {
    const next = [...questions];
    const [q] = next.splice(i, 1);
    next.splice(i + by, 0, q);
    onChange(next);
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-body font-medium">Questions *</legend>
      {questions.length === 0 && <p className="text-hint text-tertiary">No questions yet.</p>}
      <ol className="divide-y divide-divider">
        {questions.map((q, i) => (
          <li key={q.id} className="space-y-2 py-3 first:pt-0">
            <Input
              aria-label={`Question ${i + 1}`}
              placeholder={`Question ${i + 1}`}
              value={q.label}
              disabled={disabled}
              onChange={(e) => patch(i, { label: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Select value={q.type} disabled={disabled}
                onValueChange={(v) => patch(i, { type: v as QuestionType, options: isChoice(v as QuestionType) ? q.options ?? [] : null })}>
                <SelectTrigger id={`${idPrefix}-q${i}-type`} aria-label="Answer type" className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
                    <SelectItem key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-1.5 text-hint">
                <Checkbox checked={Boolean(q.required)} disabled={disabled} onCheckedChange={(c) => patch(i, { required: c === true })} />
                Required
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
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  <Icon icon={ArrowUp02Icon} size="sm" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Move down" disabled={i === questions.length - 1} onClick={() => move(i, 1)}>
                  <Icon icon={ArrowDown02Icon} size="sm" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Remove question"
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
          Add question
        </Button>
      )}
      <p className="text-hint text-tertiary">The answers are kept on the person&apos;s Forms tab, even if the process is deleted.</p>
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
  const shown = options.length ? options : [""];
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Options">
      {shown.map((o, i) => (
        <div key={i} className="relative">
          <Input
            aria-label={`Option ${i + 1}`}
            placeholder={`Option ${i + 1}`}
            value={o}
            disabled={disabled}
            className="h-8 w-32 pr-7 text-body"
            onChange={(e) => onChange(shown.map((x, j) => (j === i ? e.target.value : x)))}
          />
          {!disabled && shown.length > 1 && (
            <button type="button" aria-label={`Remove option ${i + 1}`}
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
          Option
        </Button>
      )}
    </div>
  );
}
