"use client";

import React, { useState } from "react";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { Textarea } from "@/components/desact/textarea";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import { showSuccess } from "@/lib/errors/errorToast";
import {
  acknowledgeReviewAction,
  approveReviewAction,
  sendBackReviewAction,
  shareReviewAction,
} from "@/components/modules/reviews/actions/reviewCycleActions";
import { useInvalidateReviews, useReviewPacket } from "@/components/modules/reviews/hooks";
import { AnswersView } from "@/components/modules/reviews/shared/AnswersView";
import { HeldBackNote } from "@/components/modules/reviews/shared/HeldBackNote";
import { PacketStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { REVIEW_POTENTIAL_LABELS } from "@/models/reviews";

/**
 * One person's review in one cycle (REVIEWS_DESIGN.md § 6.3). The person reads their self review and their
 * manager's once it is shared, and never a peer review (R5); their manager reads it all and shares it; a reader
 * with the result right reads it all too. Where the cycle asks for it, whoever approves the manager review reads it as
 * the manager does and approves it or sends it back with a comment (REVIEWS_PLAN.md 10.3). Upward reviews are shown
 * without their authors, once enough are in (A6). What this reader may see is the backend's answer.
 */
export function PacketContainer({ participantId }: { participantId: string }) {
  const packet = useReviewPacket(participantId);
  const invalidate = useInvalidateReviews();
  const { user } = useCurrentUser();
  const [sharing, setSharing] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [comment, setComment] = useState("");
  const [approving, setApproving] = useState(false);
  const [sendingBack, setSendingBack] = useState(false);
  const [sendBackComment, setSendBackComment] = useState("");

  if (packet.error) return <div className="mx-auto max-w-4xl"><ErrorState error={packet.error} /></div>;
  if (!packet.data) return <Skeleton className="mx-auto h-96 w-full max-w-4xl rounded-popover" aria-busy="true" />;
  const p = packet.data;
  const isSubject = user?.id === p.subject.userId;
  // Somebody who runs cycles may share on the manager's behalf (A5); the manager shares their own.
  const onBehalf = p.canShare && user?.id !== p.manager?.userId;
  const rating = p.finalRating != null ? p.scale.find((s) => s.value === p.finalRating) : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <SettingsPageHeader title={isSubject ? "Your review" : p.subject.name} backHref={isSubject ? "/reviews/me" : undefined}
          className="min-w-0 flex-1" />
        <PacketStatusBadge status={p.status} />
        {p.canShare && (
          <Button type="button" onClick={() => setSharing(true)}>
            {onBehalf ? "Share on the manager's behalf" : `Share with ${p.subject.name.split(" ")[0]}`}
          </Button>
        )}
        {p.canAcknowledge && <Button type="button" onClick={() => setAcknowledging(true)}>Acknowledge</Button>}
        {p.canApprove && (
          <>
            <Button type="button" variant="secondary" onClick={() => setSendingBack(true)}>Send back</Button>
            <Button type="button" variant="approve" onClick={() => setApproving(true)}>Approve</Button>
          </>
        )}
      </div>
      <p className="-mt-3 text-body text-tertiary">
        {p.cycleName}
        {p.manager ? ` · manager ${p.manager.name}` : ""}
        {p.sharedAt ? ` · shared ${formatDisplayDate(p.sharedAt, { style: "medium" })}` : " · not shared yet"}
        {p.amendedAt ? ` · updated ${formatDisplayDate(p.amendedAt, { style: "medium" })}` : ""}
        {!p.shared && p.sharingMode === "RELEASED_ON_DATE" && p.releaseDate
          ? ` · released on ${formatDisplayDate(p.releaseDate, { style: "medium" })}` : ""}
        {p.approver && p.status === "AWAITING_APPROVAL" ? ` · waiting for approval by ${p.approver.name}` : ""}
        {p.approver && p.approvedAt ? ` · approved by ${p.approver.name} ${formatDisplayDate(p.approvedAt, { style: "medium" })}` : ""}
      </p>

      {rating && (
        <div className="rounded-card border border-divider bg-card px-5 py-4">
          <div className="text-hint text-tertiary">Overall rating</div>
          <div className="text-section-title text-primary">{rating.value} · {rating.label}</div>
          {/* Never sent to the person reviewed (A26): the rating is theirs, why it moved is the reviewers'. */}
          {p.calibration && (
            <p className="mt-1 text-hint text-tertiary" data-test="calibration-note">
              Calibrated{p.calibration.managerRating != null ? ` from ${p.calibration.managerRating}` : ""}
              {p.calibration.by ? ` by ${p.calibration.by.name}` : ""}
              {p.calibration.at ? ` on ${formatDisplayDate(p.calibration.at, { style: "medium" })}` : ""}
              {p.calibration.reason ? `: ${p.calibration.reason}` : ""}
            </p>
          )}
          {p.potential && (
            <p className="mt-1 text-hint text-tertiary">Potential: {REVIEW_POTENTIAL_LABELS[p.potential]}</p>
          )}
        </div>
      )}

      {p.acknowledgedAt && (
        <div className="rounded-card border border-divider bg-subtle/50 px-5 py-3 text-body">
          <span className="font-medium text-primary">
            {isSubject ? "You acknowledged" : `${p.subject.name.split(" ")[0]} acknowledged`} this review on{" "}
            {formatDisplayDate(p.acknowledgedAt, { style: "medium" })}.
          </span>
          {p.acknowledgementComment && <p className="mt-1 whitespace-pre-line text-primary">{p.acknowledgementComment}</p>}
        </div>
      )}

      {p.managerReview ? <AnswersView block={p.managerReview} scale={p.scale} mentions={p.mentions} />
        : <p className="text-body text-tertiary">The manager review is not in yet.</p>}
      {p.self && <AnswersView block={p.self} scale={p.scale} mentions={p.mentions} title={isSubject ? "Your self review" : undefined} />}
      {(p.peers.length > 0 || p.peersHeldBack > 0) && (
        <div className="space-y-3">
          <h2 className="text-body font-medium text-tertiary">
            Peer Reviews — {isSubject ? "" : `${p.subject.name.split(" ")[0]} never sees these`}
          </h2>
          {p.peers.map((b) => <AnswersView key={b.assignmentId} block={b} scale={p.scale} mentions={p.mentions} />)}
          <HeldBackNote count={p.peersHeldBack} threshold={p.anonymityThreshold} />
        </div>
      )}
      {(p.upward.length > 0 || p.upwardHeldBack > 0) && (
        <div className="space-y-3">
          <h2 className="text-body font-medium text-tertiary">Upward reviews — from direct reports, anonymous</h2>
          {p.upward.map((b) => <AnswersView key={b.assignmentId} block={b} scale={p.scale} mentions={p.mentions} />)}
          <HeldBackNote count={p.upwardHeldBack} threshold={p.upwardThreshold} kind="upward" />
        </div>
      )}

      <ConfirmDialog
        open={approving}
        title="Approve review"
        confirmLabel="Approve"
        onCancelAction={() => setApproving(false)}
        onConfirmAction={async () => {
          const res = await approveReviewAction(p.participantId);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setApproving(false);
          await invalidate();
          showSuccess("Review approved.");
          return null;
        }}
      >
        <p>
          {p.sharingMode === "RELEASED_ON_DATE"
            ? `${p.manager?.name ?? "The manager"}'s review of ${p.subject.name} is released with the others on the date.`
            : `${p.manager?.name ?? "The manager"} can then share the review with ${p.subject.name}.`}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={sendingBack}
        title="Send back"
        confirmLabel="Send back"
        onCancelAction={() => setSendingBack(false)}
        onConfirmAction={async () => {
          if (!sendBackComment.trim()) return "Say what should change.";
          const res = await sendBackReviewAction({ participantId: p.participantId, comment: sendBackComment.trim() });
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setSendingBack(false);
          setSendBackComment("");
          await invalidate();
          showSuccess("Review sent back.");
          return null;
        }}
      >
        <p>{p.manager?.name ?? "The manager"} reads your comment on the review, which opens again with its answers.</p>
        <Textarea rows={4} aria-label="What should change" value={sendBackComment}
          onChange={(e) => setSendBackComment(e.target.value)} />
      </ConfirmDialog>

      <ConfirmDialog
        open={sharing}
        title="Share review"
        confirmLabel="Share"
        onCancelAction={() => setSharing(false)}
        onConfirmAction={async () => {
          const res = await shareReviewAction(p.participantId);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setSharing(false);
          await invalidate();
          showSuccess("Review shared.");
          return null;
        }}
      >
        <p>
          {onBehalf
            ? `${p.subject.name} will read ${p.manager?.name ?? "the manager"}'s review, their self review and the rating, and is told as if the manager had shared it. The journal records that you shared it on the manager's behalf. A shared review cannot be unshared.`
            : `${p.subject.name} will read your review, their self review and the rating. Peer reviews stay with you. A shared review cannot be unshared; you can still update yours.`}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={acknowledging}
        title="Acknowledge review"
        confirmLabel="Acknowledge"
        onCancelAction={() => setAcknowledging(false)}
        onConfirmAction={async () => {
          const res = await acknowledgeReviewAction({ participantId: p.participantId, comment: comment.trim() || null });
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setAcknowledging(false);
          await invalidate();
          showSuccess("Review acknowledged.");
          return null;
        }}
      >
        <p>Acknowledging says you have read it — not that you agree. Your manager sees any comment you add.</p>
        <Textarea rows={3} aria-label="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
      </ConfirmDialog>
    </div>
  );
}
