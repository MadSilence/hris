"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
import { useDateFormatter } from "@/lib/date";
import { showSuccess } from "@/lib/errors/errorToast";
import { approvePeersAction, nominatePeersAction } from "@/components/modules/reviews/actions/reviewCycleActions";
import { useInvalidateReviews, useReviewNomination } from "@/components/modules/reviews/hooks";
import {
  REVIEW_NOMINATION_STATUS_KEYS,
  nominationProblem,
  type Nomination,
  type PersonRef,
} from "@/models/reviews";

const nameOf = (u: PickedUser, fallback: string) => [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || fallback;

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
  const t = useTranslations("reviews");
  const formatDisplayDate = useDateFormatter();
  const invalidate = useInvalidateReviews();
  const acting = n.canNominate || n.canApprove;
  const due = n.canApprove ? n.approvalDueOn : n.nominationDueOn;
  const [picked, setPicked] = useState<PersonRef[]>(n.peers);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setPicked(n.peers); }, [n.peers]);

  const problem = nominationProblem(picked.map((p) => p.userId), n, t);
  const title = n.canApprove ? t("nomination.title.approve", { name: n.subject.name })
    : n.canNominate ? t("steps.nominatePeers") : t("nomination.title.view", { name: n.subject.name });
  const medium = (iso: string) => formatDisplayDate(iso, { style: "medium" });
  const facts = [
    n.cycleName,
    due && acting ? t("write.due", { date: medium(due) }) : null,
    n.approver && !n.canApprove ? t("nomination.approvedBy", { name: n.approver.name }) : null,
  ].filter(Boolean).join(" · ");

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
        setError(res.errorMessage ?? t("error.generic"));
        return;
      }
      await invalidate();
      showSuccess(n.canApprove ? t("nomination.approvedToast") : t("nomination.sentToast"));
    } finally {
      setBusy(false);
    }
  };

  const add = (u: PickedUser | null) => {
    if (!u || picked.some((p) => p.userId === u.id)) return;
    if (n.excluded.includes(u.id)) {
      setError(t("nomination.problem.excluded"));
      return;
    }
    setError(null);
    setPicked([...picked, { userId: u.id, name: nameOf(u, t("nomination.somebody")) }]);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <SettingsPageHeader title={title} backHref="/reviews/me" className="min-w-0 flex-1" />
        <StatusBadge status={n.status === "APPROVED" ? "active" : "draft"} label={t(REVIEW_NOMINATION_STATUS_KEYS[n.status])} />
      </div>
      <p className="-mt-3 text-body text-tertiary">{facts}</p>

      {n.canNominate && (
        <p className="text-body text-primary">
          {t("nomination.nominateIntro", {
            same: n.peerMin === n.peerMax ? "yes" : "no",
            min: n.peerMin,
            max: n.peerMax,
            hasApprover: n.approver ? "yes" : "no",
            approver: n.approver?.name ?? "",
            hasDate: n.approvalDueOn ? "yes" : "no",
            date: n.approvalDueOn ? medium(n.approvalDueOn) : "",
          })}
        </p>
      )}
      {n.canApprove && (
        <p className="text-body text-primary">
          {t("nomination.approveIntro", {
            name: n.subject.name,
            min: n.peerMin,
            max: n.peerMax,
            hasDate: n.approvalDueOn ? "yes" : "no",
            date: n.approvalDueOn ? medium(n.approvalDueOn) : "",
          })}
        </p>
      )}
      {!acting && n.status === "APPROVED" && (
        <p className="text-body text-primary">
          {n.autoApproved
            ? t("nomination.autoApproved", { count: n.peersAsked })
            : t("nomination.peersAsked", { count: n.peersAsked })}
        </p>
      )}
      {!acting && n.status === "AWAITING_APPROVAL" && (
        <p className="text-body text-primary">
          {n.approver ? t("nomination.waitingFor", { name: n.approver.name }) : t("nomination.waitingForManager")}
        </p>
      )}

      <div className="space-y-2 rounded-card border border-divider bg-card p-5">
        {picked.length === 0 && (
          <EmptyState compact scene="team-and-org" title={t("nomination.empty.title")}
            description={n.canNominate ? t("nomination.empty.nominate") : acting ? t("nomination.empty.approve") : t("nomination.empty.view")} />
        )}
        {picked.map((p) => (
          <div key={p.userId} className="flex items-center justify-between rounded-control border border-divider px-3 py-1.5 text-body">
            {p.name}
            {acting && (
              <button type="button" aria-label={t("nomination.remove", { name: p.name })} className="text-tertiary hover:text-primary"
                onClick={() => setPicked(picked.filter((x) => x.userId !== p.userId))}>
                <Icon icon={Cancel01Icon} size="sm" />
              </button>
            )}
          </div>
        ))}
        {acting && picked.length < n.peerMax && <UserPickerField value={null} placeholder={t("nomination.addPerson")} onChange={add}
          searchPath={`/reviews/nominations/${n.participantId}/colleagues`} />}
      </div>

      {acting && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant={n.canApprove ? "approve" : "primary"} disabled={busy} onClick={send}>
            {n.canApprove ? t("steps.approvePeers") : t("nomination.send")}
          </Button>
          <span className="text-hint text-tertiary">{t("nomination.count", { count: picked.length, min: n.peerMin, max: n.peerMax })}</span>
        </div>
      )}
      <FormError message={error} />
    </div>
  );
}
