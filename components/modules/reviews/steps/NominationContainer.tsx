"use client";

import React, { useEffect, useState } from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionStatus } from "@/components/models/ActionStatus";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { formatDisplayDate } from "@/lib/date";
import { showSuccess } from "@/lib/errors/errorToast";
import { approvePeersAction, nominatePeersAction } from "@/components/modules/reviews/actions/reviewCycleActions";
import { useInvalidateReviews, useReviewNomination } from "@/components/modules/reviews/hooks";
import {
  REVIEW_NOMINATION_STATUS_LABELS,
  nominationProblem,
  type Nomination,
  type PersonRef,
} from "@/models/reviews";

const nameOf = (u: PickedUser) => [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Somebody";

/**
 * Peers nominated by the person reviewed (REVIEWS_PLAN.md 10.2). One page, two views: the person picks their peers
 * within the cycle's least and most — never themselves or their manager — and sends them; their manager approves the
 * list as it is, or removes and adds first. Nominations nobody approves by the approval date stand (A7). Whoever runs
 * cycles reads the page without acting.
 */
export function NominationContainer({ participantId }: { participantId: string }) {
  const nomination = useReviewNomination(participantId);
  if (nomination.error) return <div className="mx-auto max-w-3xl"><ErrorState error={nomination.error} /></div>;
  if (!nomination.data) return <Skeleton className="mx-auto h-64 w-full max-w-3xl rounded-popover" aria-busy="true" />;
  return <NominationView n={nomination.data} />;
}

function NominationView({ n }: { n: Nomination }) {
  const invalidate = useInvalidateReviews();
  const acting = n.canNominate || n.canApprove;
  const [picked, setPicked] = useState<PersonRef[]>(n.peers);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setPicked(n.peers); }, [n.peers]);

  const problem = nominationProblem(picked.map((p) => p.userId), n);
  const title = n.canApprove ? `Approve peers — ${n.subject.name}` : n.canNominate ? "Nominate peers" : `Peers — ${n.subject.name}`;
  const due = n.canApprove ? n.approvalDueOn : n.nominationDueOn;

  const send = async () => {
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const input = { participantId: n.participantId, reviewerUserIds: picked.map((p) => p.userId) };
      const res = n.canApprove ? await approvePeersAction(input) : await nominatePeersAction(input);
      if (res.status !== ActionStatus.SUCCESS) {
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      await invalidate();
      showSuccess(n.canApprove ? "Peers approved and asked." : "Nomination sent for approval.");
    } finally {
      setBusy(false);
    }
  };

  const add = (u: PickedUser | null) => {
    if (!u || picked.some((p) => p.userId === u.id)) return;
    if (n.excluded.includes(u.id)) {
      setError("Neither the person nor their manager can be chosen.");
      return;
    }
    setError(null);
    setPicked([...picked, { userId: u.id, name: nameOf(u) }]);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <SettingsPageHeader title={title} backHref="/reviews/me" className="min-w-0 flex-1" />
        <StatusBadge status={n.status === "APPROVED" ? "active" : "draft"} label={REVIEW_NOMINATION_STATUS_LABELS[n.status]} />
      </div>
      <p className="-mt-3 text-body text-tertiary">
        {n.cycleName}
        {due && acting ? ` · due ${formatDisplayDate(due, { style: "medium" })}` : ""}
        {n.approver && !n.canApprove ? ` · approved by ${n.approver.name}` : ""}
      </p>

      {n.canNominate && (
        <p className="text-body text-primary">
          Choose {n.peerMin === n.peerMax ? n.peerMin : `${n.peerMin} to ${n.peerMax}`} colleagues who know your work. Your
          manager writes their own review, so they cannot be one of them. {n.approver?.name ?? "Your manager"} approves the
          list{n.approvalDueOn ? ` by ${formatDisplayDate(n.approvalDueOn, { style: "medium" })}` : ""}; if nobody does by
          then, it stands as you sent it.
        </p>
      )}
      {n.canApprove && (
        <p className="text-body text-primary">
          {n.subject.name} nominated these colleagues. Remove or add before approving — between {n.peerMin} and {n.peerMax}.
          Each approved peer is asked at once.{n.approvalDueOn
            ? ` If nobody approves by ${formatDisplayDate(n.approvalDueOn, { style: "medium" })}, the nomination stands as sent.` : ""}
        </p>
      )}
      {!acting && n.status === "APPROVED" && (
        <p className="text-body text-primary">
          {n.autoApproved ? "Nobody approved by the approval date, so the nomination stood as sent. " : ""}
          {n.peersAsked === 1 ? "1 peer was asked." : `${n.peersAsked} peers were asked.`}
        </p>
      )}
      {!acting && n.status === "AWAITING_APPROVAL" && (
        <p className="text-body text-primary">Waiting for {n.approver?.name ?? "the manager"} to approve.</p>
      )}

      <div className="space-y-2 rounded-card border border-divider bg-card p-5">
        {picked.length === 0 && (
          <EmptyState compact scene="team-and-org" title="Nobody chosen yet"
            description={n.canNominate ? "Pick the colleagues who worked with you closely enough to review you." : acting ? "Add the colleagues who should review this person." : "No peers were named."} />
        )}
        {picked.map((p) => (
          <div key={p.userId} className="flex items-center justify-between rounded-control border border-divider px-3 py-1.5 text-body">
            {p.name}
            {acting && (
              <button type="button" aria-label={`Remove ${p.name}`} className="text-tertiary hover:text-primary"
                onClick={() => setPicked(picked.filter((x) => x.userId !== p.userId))}>
                <Icon icon={Cancel01Icon} size="sm" />
              </button>
            )}
          </div>
        ))}
        {acting && picked.length < n.peerMax && <UserPickerField value={null} placeholder="Add a person" onChange={add}
          searchPath={`/reviews/nominations/${n.participantId}/colleagues`} />}
      </div>

      {acting && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" disabled={busy} onClick={send}>
            {n.canApprove ? "Approve peers" : "Send nomination"}
          </Button>
          <span className="text-hint text-tertiary">{picked.length} of {n.peerMin}–{n.peerMax}</span>
        </div>
      )}
      <FormError message={error} />
    </div>
  );
}
