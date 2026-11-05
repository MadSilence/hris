"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { Textarea } from "@/components/desact/textarea";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDateFormatter } from "@/lib/date";
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
import { REVIEW_POTENTIAL_KEYS } from "@/models/reviews";

/**
 * One person's review in one cycle (REVIEWS_DESIGN.md § 6.3). The person reads their self review and their
 * manager's once it is shared, and never a peer review (R5); their manager reads it all and shares it; a reader
 * with the result right reads it all too. Where the cycle asks for it, whoever approves the manager review reads it as
 * the manager does and approves it or sends it back with a comment (REVIEWS_PLAN.md 10.3). Upward reviews are shown
 * without their authors, once enough are in (A6). What this reader may see is the backend's answer.
 */
export function PacketContainer({ participantId }: { participantId: string }) {
  const t = useTranslations("reviews");
  const formatDisplayDate = useDateFormatter();
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
  const firstName = p.subject.name.split(" ")[0];
  const managerName = p.manager?.name ?? null;
  const medium = (iso: string) => formatDisplayDate(iso, { style: "medium" });
  const facts = [
    p.cycleName,
    p.manager ? t("packet.meta.manager", { name: p.manager.name }) : null,
    p.sharedAt ? t("packet.meta.shared", { date: medium(p.sharedAt) }) : t("packet.meta.notShared"),
    p.amendedAt ? t("packet.meta.updated", { date: medium(p.amendedAt) }) : null,
    !p.shared && p.sharingMode === "RELEASED_ON_DATE" && p.releaseDate
      ? t("packet.meta.releasedOn", { date: medium(p.releaseDate) }) : null,
    p.approver && p.status === "AWAITING_APPROVAL" ? t("packet.meta.waitingApproval", { name: p.approver.name }) : null,
    p.approver && p.approvedAt ? t("packet.meta.approvedBy", { name: p.approver.name, date: medium(p.approvedAt) }) : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <SettingsPageHeader title={isSubject ? t("packet.yourReview") : p.subject.name} backHref={isSubject ? "/reviews/me" : undefined}
          className="min-w-0 flex-1" />
        <PacketStatusBadge status={p.status} />
        {p.canShare && (
          <Button type="button" onClick={() => setSharing(true)}>
            {onBehalf ? t("packet.shareOnBehalf") : t("packet.shareWith", { name: firstName })}
          </Button>
        )}
        {p.canAcknowledge && <Button type="button" onClick={() => setAcknowledging(true)}>{t("packet.acknowledge")}</Button>}
        {p.canApprove && (
          <>
            <Button type="button" variant="secondary" onClick={() => setSendingBack(true)}>{t("packet.sendBack")}</Button>
            <Button type="button" variant="approve" onClick={() => setApproving(true)}>{t("packet.approve")}</Button>
          </>
        )}
      </div>
      <p className="-mt-3 text-body text-tertiary">{facts}</p>

      {rating && (
        <div className="rounded-card border border-divider bg-card px-5 py-4">
          <div className="text-hint text-tertiary">{t("packet.overallRating")}</div>
          <div className="text-section-title text-primary">{rating.value} · {rating.label}</div>
          {/* Never sent to the person reviewed (A26): the rating is theirs, why it moved is the reviewers'. */}
          {p.calibration && (
            <p className="mt-1 text-hint text-tertiary" data-test="calibration-note">
              {t("packet.calibrated", {
                hasFrom: p.calibration.managerRating != null ? "yes" : "no",
                from: p.calibration.managerRating ?? "",
                hasBy: p.calibration.by ? "yes" : "no",
                by: p.calibration.by?.name ?? "",
                hasAt: p.calibration.at ? "yes" : "no",
                at: p.calibration.at ? medium(p.calibration.at) : "",
                hasReason: p.calibration.reason ? "yes" : "no",
                reason: p.calibration.reason ?? "",
              })}
            </p>
          )}
          {p.potential && (
            <p className="mt-1 text-hint text-tertiary">{t("packet.potential", { potential: t(REVIEW_POTENTIAL_KEYS[p.potential]) })}</p>
          )}
        </div>
      )}

      {p.acknowledgedAt && (
        <div className="rounded-card border border-divider bg-subtle/50 px-5 py-3 text-body">
          <span className="font-medium text-primary">
            {isSubject
              ? t("packet.acknowledgedByYou", { date: medium(p.acknowledgedAt) })
              : t("packet.acknowledgedBy", { name: firstName, date: medium(p.acknowledgedAt) })}
          </span>
          {p.acknowledgementComment && <p className="mt-1 whitespace-pre-line text-primary">{p.acknowledgementComment}</p>}
        </div>
      )}

      {p.managerReview ? <AnswersView block={p.managerReview} scale={p.scale} mentions={p.mentions} />
        : <p className="text-body text-tertiary">{t("packet.managerNotIn")}</p>}
      {p.self && <AnswersView block={p.self} scale={p.scale} mentions={p.mentions} title={isSubject ? t("packet.yourSelfReview") : undefined} />}
      {(p.peers.length > 0 || p.peersHeldBack > 0) && (
        <div className="space-y-3">
          <h2 className="text-body font-medium text-tertiary">
            {isSubject ? t("packet.peerHeading") : t("packet.peerHeadingHidden", { name: firstName })}
          </h2>
          {p.peers.map((b) => <AnswersView key={b.assignmentId} block={b} scale={p.scale} mentions={p.mentions} />)}
          <HeldBackNote count={p.peersHeldBack} threshold={p.anonymityThreshold} />
        </div>
      )}
      {(p.upward.length > 0 || p.upwardHeldBack > 0) && (
        <div className="space-y-3">
          <h2 className="text-body font-medium text-tertiary">{t("packet.upwardHeading")}</h2>
          {p.upward.map((b) => <AnswersView key={b.assignmentId} block={b} scale={p.scale} mentions={p.mentions} />)}
          <HeldBackNote count={p.upwardHeldBack} threshold={p.upwardThreshold} kind="upward" />
        </div>
      )}

      <ConfirmDialog
        open={approving}
        title={t("packet.approveDialog.title")}
        confirmLabel={t("packet.approve")}
        onCancelAction={() => setApproving(false)}
        onConfirmAction={async () => {
          const res = await approveReviewAction(p.participantId);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
          setApproving(false);
          await invalidate();
          showSuccess(t("packet.approveDialog.done"));
          return null;
        }}
      >
        <p>
          {p.sharingMode === "RELEASED_ON_DATE"
            ? t("packet.approveDialog.released", { hasManager: managerName ? "yes" : "no", manager: managerName ?? "", subject: p.subject.name })
            : t("packet.approveDialog.share", { hasManager: managerName ? "yes" : "no", manager: managerName ?? "", subject: p.subject.name })}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={sendingBack}
        title={t("packet.sendBack")}
        confirmLabel={t("packet.sendBack")}
        onCancelAction={() => setSendingBack(false)}
        onConfirmAction={async () => {
          if (!sendBackComment.trim()) return t("packet.sendBackDialog.required");
          const res = await sendBackReviewAction({ participantId: p.participantId, comment: sendBackComment.trim() });
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
          setSendingBack(false);
          setSendBackComment("");
          await invalidate();
          showSuccess(t("packet.sendBackDialog.done"));
          return null;
        }}
      >
        <p>{t("packet.sendBackDialog.body", { hasManager: managerName ? "yes" : "no", manager: managerName ?? "" })}</p>
        <Textarea rows={4} aria-label={t("packet.sendBackDialog.comment")} value={sendBackComment}
          onChange={(e) => setSendBackComment(e.target.value)} />
      </ConfirmDialog>

      <ConfirmDialog
        open={sharing}
        title={t("packet.shareDialog.title")}
        confirmLabel={t("packet.shareDialog.confirm")}
        onCancelAction={() => setSharing(false)}
        onConfirmAction={async () => {
          const res = await shareReviewAction(p.participantId);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
          setSharing(false);
          await invalidate();
          showSuccess(t("packet.shareDialog.done"));
          return null;
        }}
      >
        <p>
          {onBehalf
            ? t("packet.shareDialog.onBehalf", { subject: p.subject.name, hasManager: managerName ? "yes" : "no", manager: managerName ?? "" })
            : t("packet.shareDialog.own", { subject: p.subject.name })}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={acknowledging}
        title={t("packet.acknowledgeDialog.title")}
        confirmLabel={t("packet.acknowledge")}
        onCancelAction={() => setAcknowledging(false)}
        onConfirmAction={async () => {
          const res = await acknowledgeReviewAction({ participantId: p.participantId, comment: comment.trim() || null });
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
          setAcknowledging(false);
          await invalidate();
          showSuccess(t("packet.acknowledgeDialog.done"));
          return null;
        }}
      >
        <p>{t("packet.acknowledgeDialog.body")}</p>
        <Textarea rows={3} aria-label={t("packet.acknowledgeDialog.comment")} value={comment} onChange={(e) => setComment(e.target.value)} />
      </ConfirmDialog>
    </div>
  );
}
