"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { Textarea } from "@/components/desact/textarea";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { StickyPageBar } from "@/components/layout/StickyPageBar";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import { showSuccess } from "@/lib/errors/errorToast";
import {
  declineReviewAction,
  saveReviewDraftAction,
  submitReviewAction,
} from "@/components/modules/reviews/actions/reviewCycleActions";
import { useInvalidateReviews, useReviewAssignment } from "@/components/modules/reviews/hooks";
import { AnswersView, answerText } from "@/components/modules/reviews/shared/AnswersView";
import { HeldBackNote } from "@/components/modules/reviews/shared/HeldBackNote";
import { AssignmentStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import { REVIEW_KIND_LABELS, replaceMentions, type AnswerInput, type Writing } from "@/models/reviews";
import { AnswerField, type AnswerState } from "./AnswerField";
import { FieldError } from "@/components/desact/field-error";
import { InlineAlert } from "@/components/desact/alert";

const AUTOSAVE_MS = 1500;

function initial(w: Writing): Record<string, AnswerState> {
  const out: Record<string, AnswerState> = {};
  const source: AnswerInput[] = w.status === "SUBMITTED"
    ? w.submitted.map((a) => ({ questionId: a.questionId, value: a.value, comment: a.comment }))
    : w.draft;
  for (const a of source) out[a.questionId] = { value: a.value ?? null, comment: a.comment ?? "" };
  return out;
}

const empty = (v: AnswerState["value"]) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);

/**
 * Writing one review (REVIEWS_DESIGN.md § 12.5): the form, answered in place, the draft saved as it is typed, and
 * Submit. A manager also reads what is already in — the self review and the peers — beside their own form.
 */
export function WriteReviewContainer({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const review = useReviewAssignment(assignmentId);
  const invalidate = useInvalidateReviews();
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [loaded, setLoaded] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [amending, setAmending] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const w = review.data;
  useEffect(() => {
    if (w && loaded !== `${w.id}:${w.status}`) {
      setAnswers(initial(w));
      setLoaded(`${w.id}:${w.status}`);
      setTouched(false);
    }
  }, [w, loaded]);

  const writable = Boolean(w && w.cycleStatus === "ACTIVE" && (w.status === "OPEN" || (amending && w.canAmend)));
  const asks = useMemo(() => (w?.form?.questions ?? []).filter((q) => q.type !== "SECTION"), [w]);
  const missing = asks.filter((q) => q.required && empty(answers[q.id]?.value)).map((q) => q.id);
  const answered = asks.filter((q) => !empty(answers[q.id]?.value)).length;
  const payload = (): AnswerInput[] =>
    Object.entries(answers).map(([questionId, a]) => ({ questionId, value: a.value, comment: a.comment || null }));

  // The draft is kept as typed, a moment after the last keystroke; an amendment is not a draft.
  useEffect(() => {
    if (!w || !touched || w.status !== "OPEN" || !writable) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaveState("saving");
      const res = await saveReviewDraftAction({ id: w.id, answers: payload() });
      setSaveState(res.status === ActionStatus.SUCCESS ? "saved" : "idle");
    }, AUTOSAVE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // payload reads answers; answers is what drives the save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, touched]);

  if (review.error) return <div className="mx-auto max-w-3xl"><ErrorState error={review.error} /></div>;
  if (!w) return <Skeleton className="mx-auto h-96 w-full max-w-3xl rounded-popover" aria-busy="true" />;

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (timer.current) clearTimeout(timer.current);
      const res = await submitReviewAction({ id: w.id, answers: payload() });
      if (res.status !== ActionStatus.SUCCESS) {
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      setConfirmSubmit(false);
      setAmending(false);
      await invalidate();
      showSuccess(w.canAmend ? "Review updated and shared again." : "Review submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  const subjectLine = w.kind === "SELF" ? "About yourself" : `About ${w.subject.name}`;
  const hasContext = w.context.length > 0 || w.peersHeldBack > 0 || w.upwardHeldBack > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-16">
      <StickyPageBar className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <SettingsPageHeader title={REVIEW_KIND_LABELS[w.kind]} backHref="/reviews/me" className="min-w-0 flex-1" />
          <AssignmentStatusBadge status={w.status} />
          <div className="flex flex-wrap items-center gap-2">
            {writable && w.status === "OPEN" && (
              <span className="text-hint text-tertiary" aria-live="polite">
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Draft saved" : "Saved as you type"}
              </span>
            )}
            {w.canDecline && <Button type="button" variant="ghost" onClick={() => setDeclining(true)}>Decline</Button>}
            {w.canAmend && !amending && <Button type="button" variant="secondary" onClick={() => setAmending(true)}>Edit</Button>}
            {writable && (
              <Button type="button" disabled={submitting}
                onClick={() => {
                  if (missing.length > 0) { setShowMissing(true); return; }
                  setConfirmSubmit(true);
                }}>
                {w.canAmend ? "Update and share again" : "Submit"}
              </Button>
            )}
          </div>
        </div>
        <p className="text-body text-tertiary">
          {subjectLine} · {w.cycleName}
          {w.dueOn ? ` · due ${formatDisplayDate(w.dueOn, { style: "medium" })}` : ""}
          {w.anonymous ? " · Your name is not shown with this review, to anybody." : ""}
        </p>
        {writable && asks.length > 0 && (
          <div className="flex items-center gap-3 pt-1">
            <div
              role="progressbar"
              aria-label="Answered"
              aria-valuemin={0}
              aria-valuemax={asks.length}
              aria-valuenow={answered}
              className="h-1.5 flex-1 overflow-hidden rounded-pill bg-mist"
            >
              <div className="h-full rounded-pill bg-accent transition-[width]" style={{ width: `${(answered / asks.length) * 100}%` }} />
            </div>
            <span className={showMissing && missing.length > 0 ? "text-hint text-danger-text" : "text-hint text-tertiary"}>
              {showMissing && missing.length > 0
                ? missing.length === 1 ? "One required question is not answered" : `${missing.length} required questions are not answered`
                : `${answered} of ${asks.length} answered`}
            </span>
          </div>
        )}
      </StickyPageBar>
      <FormError message={error} />
      {w.sentBackComment && (
        <div data-test="sent-back">
          <InlineAlert tone="pending" title="Sent back for changes">
            <p className="whitespace-pre-line">{w.sentBackComment}</p>
          </InlineAlert>
        </div>
      )}

      <div className={hasContext ? "grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : ""}>
        <div className="space-y-6">
          {w.form?.description && (
            <p className="whitespace-pre-line rounded-card border border-divider bg-subtle/50 px-5 py-3 text-body text-primary">
              {replaceMentions(w.form.description, w.mentions)}
            </p>
          )}

          {writable ? (
            <ol className="space-y-6 rounded-card border border-divider bg-card p-5 sm:p-6">
              {(() => {
                let n = 0;
                return (w.form?.questions ?? []).map((q) => {
                  if (q.type === "SECTION") {
                    return (
                      <li key={q.id} className="space-y-1 border-t border-divider pt-5 first:border-t-0 first:pt-0">
                        <h2 className="text-body font-semibold text-primary">{replaceMentions(q.label, w.mentions)}</h2>
                        {q.description && <p className="whitespace-pre-line text-body text-tertiary">{replaceMentions(q.description, w.mentions)}</p>}
                      </li>
                    );
                  }
                  n += 1;
                  const invalid = showMissing && missing.includes(q.id);
                  return (
                    <li key={q.id} className="space-y-2">
                      <RequiredLabel htmlFor={`answer-${q.id}`} required={Boolean(q.required)} className="text-body font-medium text-primary">
                        {n}. {replaceMentions(q.label, w.mentions)}
                      </RequiredLabel>
                      {q.description && <p className="whitespace-pre-line text-hint text-tertiary">{replaceMentions(q.description, w.mentions)}</p>}
                      <AnswerField question={q} scale={w.scale} value={answers[q.id] ?? { value: null, comment: "" }}
                        disabled={submitting} invalid={invalid}
                        onChange={(next) => { setAnswers((a) => ({ ...a, [q.id]: next })); setTouched(true); }} />
                      {invalid && <FieldError>Answer this question.</FieldError>}
                    </li>
                  );
                });
              })()}
            </ol>
          ) : (
            <section className="space-y-3 rounded-card border border-divider bg-card p-5">
              {w.status === "SUBMITTED" ? (
                <>
                  <p className="text-body text-tertiary">
                    Submitted {w.submittedAt ? formatDisplayDate(w.submittedAt, { style: "medium" }) : ""}.
                  </p>
                  <dl className="space-y-3">
                    {w.submitted.map((a) => (
                      <div key={a.questionId}>
                        <dt className="text-body font-medium text-primary">{replaceMentions(a.label, w.mentions)}</dt>
                        <dd className="whitespace-pre-line text-body text-primary">{answerText(a, w.scale)}</dd>
                        {a.comment && <dd className="whitespace-pre-line text-body text-tertiary">{a.comment}</dd>}
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <p className="text-body text-tertiary">
                  {w.cycleStatus !== "ACTIVE" ? "This cycle is closed; the review can no longer be written."
                    : "This review is no longer yours to write."}
                </p>
              )}
            </section>
          )}

        </div>

        {hasContext && (
          <aside className="space-y-4">
            <h2 className="text-body font-medium text-tertiary">Already in</h2>
            {w.context.map((b) => <AnswersView key={b.assignmentId} block={b} scale={w.scale} mentions={w.mentions} />)}
            <HeldBackNote count={w.peersHeldBack} threshold={w.anonymityThreshold} />
            <HeldBackNote count={w.upwardHeldBack} threshold={w.upwardThreshold} kind="upward" />
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={confirmSubmit}
        title={w.canAmend ? "Update review" : "Submit review"}
        confirmLabel={w.canAmend ? "Update and share" : "Submit"}
        onCancelAction={() => setConfirmSubmit(false)}
        onConfirmAction={async () => {
          await submit();
          return null;
        }}
      >
        <p>
          {w.canAmend
            ? `${w.subject.name} has already read this review; they see the new version, marked as updated, and are asked to acknowledge it again.`
            : w.kind === "MANAGER"
              ? `Once submitted, the review changes only after it is shared, as an update ${w.subject.name.split(" ")[0]} sees.`
              : "Once submitted, the review can no longer be changed."}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={declining}
        title="Decline peer review"
        confirmLabel="Decline"
        destructive
        onCancelAction={() => setDeclining(false)}
        onConfirmAction={async () => {
          const res = await declineReviewAction({ id: w.id, reason: declineReason.trim() || null });
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setDeclining(false);
          await invalidate();
          router.push("/reviews/me");
          return null;
        }}
      >
        <p>Whoever runs the cycle is told, and may ask somebody else.</p>
        <Textarea rows={3} aria-label="Reason" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
      </ConfirmDialog>
    </div>
  );
}
