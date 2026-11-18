"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import type { NoAnswer } from "@/models/automations";
import { CompactPick } from "../conditions/chrome";
import { PeoplePicker } from "../people/PeoplePicker";
import { TokenTextField } from "../tokens/TokenTextField";
import { DaysInput, Field, FieldStack, MistNote } from "../parts/parts";
import { errorFor } from "../parts/problems";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDocumentTemplates } from "@/components/modules/signing/hooks/useDocumentsSection";
import type { StepPartProps } from "./stepPartProps";

/** Send a notification (S1): who gets it, and the message with field tokens. */
export const NotifyFields: React.FC<StepPartProps> = ({ step, catalog, problems, onStep, event, placeholders }) => {
  const t = useTranslations("automationsSettings");
  const ids = { who: React.useId(), message: React.useId(), hint: React.useId() };
  return (
    <FieldStack>
      <Field label={t("notify.who")} labelId={ids.who} required error={errorFor(t, problems, "recipients")}>
        <PeoplePicker aria-labelledby={ids.who} value={step.recipients ?? []} onChange={(recipients) => onStep({ recipients })}
          catalog={catalog} event={event} invalid={Boolean(errorFor(t, problems, "recipients"))} />
      </Field>
      <Field label={t("notify.message")} labelId={ids.message} required error={errorFor(t, problems, "text")} hint={t("tokens.typeAt")}>
        <TokenTextField multiline aria-labelledby={ids.message} value={step.text ?? ""} onChange={(text) => onStep({ text })}
          placeholders={placeholders} invalid={Boolean(errorFor(t, problems, "text"))} />
      </Field>
    </FieldStack>
  );
};

/** Send an email (G4): to whom, a one-line subject with inline tokens, and the message with "Insert a field". */
export const EmailFields: React.FC<StepPartProps> = ({ step, catalog, problems, onStep, event, placeholders }) => {
  const t = useTranslations("automationsSettings");
  const ids = { to: React.useId(), subject: React.useId(), body: React.useId() };
  return (
    <FieldStack>
      <Field label={t("email.to")} labelId={ids.to} required error={errorFor(t, problems, "recipients")}>
        <PeoplePicker aria-labelledby={ids.to} value={step.recipients ?? []} onChange={(recipients) => onStep({ recipients })}
          catalog={catalog} event={event} invalid={Boolean(errorFor(t, problems, "recipients"))} />
      </Field>
      <Field label={t("email.subject")} labelId={ids.subject} required error={errorFor(t, problems, "subject")}>
        <TokenTextField aria-labelledby={ids.subject} value={step.subject ?? ""} onChange={(subject) => onStep({ subject })}
          placeholders={placeholders} invalid={Boolean(errorFor(t, problems, "subject"))} />
      </Field>
      <Field label={t("email.message")} labelId={ids.body} required error={errorFor(t, problems, "body")}>
        <TokenTextField multiline insertButton aria-labelledby={ids.body} value={step.body ?? ""} onChange={(body) => onStep({ body })}
          placeholders={placeholders} invalid={Boolean(errorFor(t, problems, "body"))} />
      </Field>
    </FieldStack>
  );
};

/** "Due [7 days] after it's created" — the number typed, the rest plain text. */
const DueRow: React.FC<{ value: number | null | undefined; onChange: (v: number | null) => void; after: string; invalid: boolean; label: string }> = ({
  value,
  onChange,
  after,
  invalid,
  label,
}) => (
  <div className="flex items-center gap-2">
    <DaysInput value={value} onChange={onChange} invalid={invalid} aria-label={label} />
    <span className="text-body text-secondary">{after}</span>
  </div>
);

/** Create a task (S2, S2b): title, description, assignee and its hint, due so many days after it's created. */
export const TaskFields: React.FC<StepPartProps> = ({ step, catalog, problems, onStep, event, placeholders }) => {
  const t = useTranslations("automationsSettings");
  const ids = { title: React.useId(), description: React.useId(), assignee: React.useId() };
  return (
    <FieldStack>
      <Field label={t("task.title")} labelId={ids.title} required error={errorFor(t, problems, "title")}>
        <TokenTextField aria-labelledby={ids.title} value={step.title ?? ""} onChange={(title) => onStep({ title })}
          placeholders={placeholders} invalid={Boolean(errorFor(t, problems, "title"))} />
      </Field>
      <Field label={t("task.description")} labelId={ids.description} error={errorFor(t, problems, "description")}>
        <TokenTextField multiline aria-labelledby={ids.description} value={step.description ?? ""}
          onChange={(description) => onStep({ description: description || null })} placeholders={placeholders} />
      </Field>
      <Field label={t("task.assignee")} labelId={ids.assignee} required error={errorFor(t, problems, "assignee", step.type)}
        hint={t("task.assigneeHint")}>
        <PeoplePicker mode="single" aria-labelledby={ids.assignee} value={step.assignee ? [step.assignee] : []}
          onChange={(v) => onStep({ assignee: v[0] ?? null })} catalog={catalog} event={event}
          invalid={Boolean(errorFor(t, problems, "assignee"))} />
      </Field>
      <Field label={t("task.due")} error={errorFor(t, problems, "dueDays")}>
        <DueRow label={t("task.due")} value={step.dueDays} onChange={(dueDays) => onStep({ dueDays })} after={t("task.afterCreated")}
          invalid={Boolean(errorFor(t, problems, "dueDays"))} />
      </Field>
    </FieldStack>
  );
};

const NO_ANSWER: NoAnswer[] = ["ASK_THEIR_MANAGER", "STOP", "DECLINE"];

/**
 * Ask for approval (D3, F3): who approves; if there's no answer in N days, then ask their manager, stop the run, or
 * treat it as declined (QA1: it goes down the Declined path; the word is `design/QUESTIONS.md` Q-2); a daily reminder.
 */
export const ApprovalFields: React.FC<StepPartProps> = ({ step, catalog, problems, onStep, event }) => {
  const t = useTranslations("automationsSettings");
  const ids = { who: React.useId(), wait: React.useId(), remind: React.useId() };
  return (
    <FieldStack>
      <Field label={t("approval.who")} labelId={ids.who} required error={errorFor(t, problems, "assignee", step.type)}>
        <PeoplePicker mode="single" aria-labelledby={ids.who} value={step.assignee ? [step.assignee] : []}
          onChange={(v) => onStep({ assignee: v[0] ?? null })} catalog={catalog} event={event}
          invalid={Boolean(errorFor(t, problems, "assignee"))} />
      </Field>
      <Field label={t("approval.noAnswer")} labelId={ids.wait} error={errorFor(t, problems, "maxDays")}>
        <div className="flex items-center gap-2">
          <DaysInput value={step.maxDays} onChange={(maxDays) => onStep({ maxDays })} aria-labelledby={ids.wait}
            invalid={Boolean(errorFor(t, problems, "maxDays"))} />
          <span className="shrink-0 text-body text-secondary">{t("approval.then")}</span>
          <div className="min-w-0 flex-1">
            <CompactPick
              size="md"
              options={NO_ANSWER.map((v) => ({ value: v, label: t(`approval.ifNoAnswer.${v}`) }))}
              value={step.ifNoAnswer ?? "ASK_THEIR_MANAGER"}
              onChange={(v) => onStep({ ifNoAnswer: v as NoAnswer })}
              placeholder={t("approval.ifNoAnswer.ASK_THEIR_MANAGER")}
              emptyLabel={t("common.noResults")}
              ariaLabel={t("approval.thenLabel")}
            />
          </div>
        </div>
      </Field>
      <label htmlFor={ids.remind} className="flex w-fit cursor-pointer items-center gap-2 text-body">
        <Checkbox id={ids.remind} checked={step.remindDaily === true} onCheckedChange={(c) => onStep({ remindDaily: c === true })} />
        {t("approval.remind")}
      </label>
    </FieldStack>
  );
};

/** Start a review (S7, QA3): the form, one reviewer, due so many days after it starts. */
export const ReviewFields: React.FC<StepPartProps> = ({ step, catalog, problems, onStep, event }) => {
  const t = useTranslations("automationsSettings");
  const ids = { reviewer: React.useId() };
  const gone = Boolean(step.formId) && !catalog.reviewForms.some((f) => f.value === step.formId);
  return (
    <FieldStack>
      <Field label={t("review.form")} required error={gone ? t("problems.removed") : errorFor(t, problems, "formId")}>
        <CompactPick
          size="md"
          options={catalog.reviewForms.map((f) => ({ value: f.value, label: f.label ?? f.value }))}
          value={gone ? null : step.formId ?? null}
          onChange={(formId) => onStep({ formId })}
          placeholder={t("review.pickForm")}
          emptyLabel={t("review.noForms")}
          ariaLabel={t("review.form")}
          invalid={gone || Boolean(errorFor(t, problems, "formId"))}
        />
      </Field>
      <Field label={t("review.reviewer")} labelId={ids.reviewer} required error={errorFor(t, problems, "assignee", step.type)}>
        <PeoplePicker mode="single" aria-labelledby={ids.reviewer} value={step.assignee ? [step.assignee] : []}
          onChange={(v) => onStep({ assignee: v[0] ?? null })} catalog={catalog} event={event}
          invalid={Boolean(errorFor(t, problems, "assignee"))} />
      </Field>
      <Field label={t("review.due")} required error={errorFor(t, problems, "dueDays")}>
        <DueRow label={t("review.due")} value={step.dueDays} onChange={(dueDays) => onStep({ dueDays })} after={t("review.afterStarts")}
          invalid={Boolean(errorFor(t, problems, "dueDays"))} />
      </Field>
    </FieldStack>
  );
};

/**
 * Send for signature (automations-send-for-signature A02): one template; who signs and the time to sign are the
 * template's, shown read-only — the step names nothing else (DOCUMENTS_DESIGN.md § 5.5). The template's name is the
 * signing's title.
 */
export const SignFields: React.FC<StepPartProps> = ({ step, problems, onStep }) => {
  const t = useTranslations("automationsSettings");
  const ids = { template: React.useId() };
  const { data: templates = [] } = useDocumentTemplates();
  const usable = templates.filter((x) => x.isActive || x.id === step.documents?.[0]);
  const chosen = templates.find((x) => x.id === step.documents?.[0]) ?? null;
  const error = errorFor(t, problems, "documents");
  const signers = [...(chosen?.signers ?? [])].sort((a, b) => (a.order ?? 1) - (b.order ?? 1));
  return (
    <FieldStack>
      <Field label={t("sign.template")} htmlFor={ids.template} required error={error} hint={t("sign.templateHint")}>
        <SearchableSelect
          id={ids.template}
          options={usable.map((x) => ({ value: x.id, label: x.name }))}
          value={chosen?.id ?? step.documents?.[0] ?? null}
          onChange={(id) => {
            const picked = templates.find((x) => x.id === id);
            onStep({ documents: id ? [id] : [], title: picked?.name ?? "" });
          }}
          placeholder={t("sign.pick")}
          emptyLabel={t("sign.noTemplate")}
          clearable={false}
        />
      </Field>
      {chosen && (
        <>
          <Field label={t("sign.who")} hint={t("sign.whoHint")}>
            <ol className="flex flex-col gap-1 rounded-control bg-subtle p-2">
              {signers.map((s, i) => (
                <li key={s.key} className="flex h-8 items-center gap-2 text-body text-primary">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-pill bg-surface text-label text-secondary">
                    {s.order ?? i + 1}
                  </span>
                  <span className="truncate">{s.label?.trim() ? s.label : t(`sign.kind.${s.kind}`)}</span>
                </li>
              ))}
            </ol>
          </Field>
          <Field label={t("sign.timeToSign")}>
            <p className="text-body text-primary">{t("sign.days", { count: chosen.envelopeExpiryDays })}</p>
          </Field>
          {chosen.problems.length > 0 && <p className="text-label text-status-declined-text">{t("sign.templateProblem")}</p>}
        </>
      )}
    </FieldStack>
  );
};

/** Send a survey (K9): the survey by name — no surveys module yet — and who gets it. */
export const SurveyFields: React.FC<StepPartProps> = ({ step, catalog, problems, onStep, event }) => {
  const t = useTranslations("automationsSettings");
  const ids = { survey: React.useId(), who: React.useId() };
  return (
    <FieldStack>
      <Field label={t("survey.name")} htmlFor={ids.survey} required error={errorFor(t, problems, "survey")}>
        <Input id={ids.survey} value={step.survey ?? ""} onChange={(e) => onStep({ survey: e.target.value })}
          aria-invalid={Boolean(errorFor(t, problems, "survey")) || undefined} />
      </Field>
      <Field label={t("survey.who")} labelId={ids.who} required error={errorFor(t, problems, "recipients")}>
        <PeoplePicker aria-labelledby={ids.who} value={step.recipients ?? []} onChange={(recipients) => onStep({ recipients })}
          catalog={catalog} event={event} invalid={Boolean(errorFor(t, problems, "recipients"))} />
      </Field>
      <MistNote>{t("notConnected.surveys")}</MistNote>
    </FieldStack>
  );
};
