"use client";

import React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Input } from "@/public/desact/src/components/ui/input";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
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
      <legend className="text-sm font-medium">Questions *</legend>
      {questions.length === 0 && <p className="text-xs text-muted-foreground">No questions yet.</p>}
      <ol className="space-y-3">
        {questions.map((q, i) => (
          <li key={q.id} className="space-y-2 rounded-md border border-brown-200 p-2">
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
              <label className="flex items-center gap-1.5 text-xs">
                <Checkbox checked={Boolean(q.required)} disabled={disabled} onCheckedChange={(c) => patch(i, { required: c === true })} />
                Required
              </label>
            </div>
            {isChoice(q.type) && (
              <Textarea
                aria-label="Options, one per line"
                placeholder="One option per line"
                rows={3}
                value={(q.options ?? []).join("\n")}
                disabled={disabled}
                onChange={(e) => patch(i, { options: e.target.value.split("\n") })}
              />
            )}
            {!disabled && (
              <div className="flex justify-end gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Move down" disabled={i === questions.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Remove question"
                  onClick={() => onChange(questions.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {!disabled && (
        <Button type="button" size="sm" variant="outline" className="gap-1.5"
          onClick={() => onChange([...questions, { id: newId(), label: "", type: "SHORT_TEXT", required: false }])}>
          <Plus className="h-3.5 w-3.5" />
          Add Question
        </Button>
      )}
      <p className="text-xs text-muted-foreground">The answers are kept on the person&apos;s Forms tab, even if the process is deleted.</p>
    </fieldset>
  );
}
