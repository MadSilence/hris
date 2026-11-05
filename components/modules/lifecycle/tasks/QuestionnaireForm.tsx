"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Textarea } from "@/components/desact/textarea";
import { Checkbox } from "@/components/desact/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormError } from "@/components/feedback/FormError";
import type { Question } from "@/models/lifecycle";

/**
 * A questionnaire, answered in place (DECISIONS.md § "Lifecycle tasks", A5) — in a task row and on the
 * preboarding page. Sent once: the task closes with the answers. The backend checks every answer; the
 * form only stops a send with a required question left empty, where the reader can see which.
 */
export function QuestionnaireForm({ taskId, questions, onSubmit, sendDisabled }: {
  taskId: string;
  questions: Question[];
  /** A preview: the questions can be tried, nothing is sent. */
  sendDisabled?: boolean;
  onSubmit: (answers: Record<string, unknown>) => Promise<string | null>;
}) {
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (id: string, v: unknown) => setAnswers((all) => ({ ...all, [id]: v }));
  const empty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
  const missing = questions.filter((q) => q.required && empty(answers[q.id]));

  const submit = async () => {
    if (missing.length > 0) {
      setError(t("questionnaire.answerRequired", { questions: missing.map((q) => q.label).join(", ") }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setError(await onSubmit(answers));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-test="questionnaire-form">
      {questions.map((q) => {
        const id = `${taskId}-q-${q.id}`;
        const value = answers[q.id];
        const label = <RequiredLabel htmlFor={id} required={Boolean(q.required)}>{q.label}</RequiredLabel>;
        switch (q.type) {
          case "LONG_TEXT":
            return (
              <div key={q.id} className="space-y-1.5">
                {label}
                <Textarea id={id} value={typeof value === "string" ? value : ""} maxLength={4000} rows={3}
                  onChange={(e) => set(q.id, e.target.value)} disabled={busy} />
              </div>
            );
          case "NUMBER":
            return (
              <div key={q.id} className="space-y-1.5">
                {label}
                <Input id={id} type="number" value={typeof value === "string" ? value : ""}
                  onChange={(e) => set(q.id, e.target.value)} disabled={busy} />
              </div>
            );
          case "DATE":
            return (
              <div key={q.id} className="space-y-1.5">
                {label}
                <DatePicker id={id} value={typeof value === "string" ? value : ""} onChange={(v) => set(q.id, v)}
                  disabled={busy} ariaLabel={q.label} />
              </div>
            );
          case "YES_NO":
            return (
              <div key={q.id} className="space-y-1.5">
                {label}
                <RadioGroup id={id} className="flex gap-4" value={value === true ? "yes" : value === false ? "no" : ""}
                  onValueChange={(v) => set(q.id, v === "yes")} disabled={busy}>
                  <label className="flex items-center gap-2 text-body"><RadioGroupItem value="yes" />{tCommon("values.yes")}</label>
                  <label className="flex items-center gap-2 text-body"><RadioGroupItem value="no" />{tCommon("values.no")}</label>
                </RadioGroup>
              </div>
            );
          case "SINGLE_CHOICE":
            return (
              <div key={q.id} className="space-y-1.5">
                {label}
                <RadioGroup id={id} value={typeof value === "string" ? value : ""} onValueChange={(v) => set(q.id, v)} disabled={busy}>
                  {(q.options ?? []).map((o) => (
                    <label key={o} className="flex items-center gap-2 text-body"><RadioGroupItem value={o} />{o}</label>
                  ))}
                </RadioGroup>
              </div>
            );
          case "MULTIPLE_CHOICE": {
            const picked = Array.isArray(value) ? (value as string[]) : [];
            return (
              <div key={q.id} className="space-y-1.5">
                {label}
                {(q.options ?? []).map((o) => (
                  <label key={o} className="flex items-center gap-2 text-body">
                    <Checkbox checked={picked.includes(o)} disabled={busy}
                      onCheckedChange={(c) => set(q.id, c ? [...picked, o] : picked.filter((x) => x !== o))} />
                    {o}
                  </label>
                ))}
              </div>
            );
          }
          default:
            return (
              <div key={q.id} className="space-y-1.5">
                {label}
                <Input id={id} value={typeof value === "string" ? value : ""} maxLength={500}
                  onChange={(e) => set(q.id, e.target.value)} disabled={busy} />
              </div>
            );
        }
      })}
      <Button type="button" size="sm" disabled={busy || sendDisabled} onClick={() => void submit()}>{t("questionnaire.send")}</Button>
      <FormError message={error} />
    </div>
  );
}
