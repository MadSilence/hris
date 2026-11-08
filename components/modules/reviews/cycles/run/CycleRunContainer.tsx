"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert02Icon, CalendarAdd01Icon, CalendarLock01Icon, Copy01Icon, FileSearchIcon, Notification01Icon, RepeatIcon, SentIcon, SquareLock02Icon, Undo02Icon, UserAdd01Icon, UserRemove01Icon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/desact/tabs";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { useCanAccess } from "@/components/auth/useAccess";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { useDateFormatter } from "@/lib/date";
import { ActionStatus } from "@/components/models/ActionStatus";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import {
  closeCycleAction,
  nudgeReviewsAction,
  removeParticipantAction,
  shareReviewAction,
  withdrawReviewAction,
} from "@/components/modules/reviews/actions/reviewCycleActions";
import { useCycleOverview, useInvalidateReviews } from "@/components/modules/reviews/hooks";
import { AssignmentStatusBadge, CycleStatusBadge, PacketStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import {
  REVIEW_KIND_KEYS,
  REVIEW_NOMINATION_STATUS_KEYS,
  REVIEW_SHARING_KEYS,
  type AssignmentRow,
  type CycleOverview,
  type PersonRow,
} from "@/models/reviews";
import { ChoosePeersDialog, EditDatesDialog, ReassignDialog } from "./RunDialogs";
import { shownReviews } from "./runRows";
import { RepeatCycleDialog, useCycleCopies } from "../CycleCopyActions";
import { CalibrationSessionsTab } from "@/components/modules/reviews/calibration/CalibrationSessionsTab";
import { CycleResultsTab } from "@/components/modules/reviews/results/CycleResultsTab";

type ReassignTarget = Parameters<typeof ReassignDialog>[0]["target"];

/**
 * A launched cycle (REVIEWS_DESIGN.md § 12.4): who has written what, by person and by reviewer, and what a runner
 * does about it — choose peers, hand a review on, remind, take somebody out, move dates, close. It shows whether a
 * review is in, never what it says; reading that is the packet's, behind its own right.
 */
export function CycleRunContainer({ cycleId }: { cycleId: string }) {
  const t = useTranslations("reviews");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const router = useRouter();
  const overview = useCycleOverview(cycleId);
  const invalidate = useInvalidateReviews();
  const canManage = useCanAccess("REVIEWS.CYCLE", "MANAGE");
  const [peersFor, setPeersFor] = useState<PersonRow | null>(null);
  const [reassign, setReassign] = useState<ReassignTarget>(null);
  const [editingDates, setEditingDates] = useState(false);
  const [repeating, setRepeating] = useState(false);
  const copies = useCycleCopies();
  const [confirm, setConfirm] = useState<
    { kind: "close" } | { kind: "remove"; person: PersonRow } | { kind: "share"; person: PersonRow } | null
  >(null);

  const data = overview.data;
  const active = data?.cycle.status === "ACTIVE";
  const manage = canManage && active;

  const byParticipant = useMemo(() => {
    const map = new Map<string, AssignmentRow[]>();
    for (const a of data?.assignments ?? []) map.set(a.participantId, [...(map.get(a.participantId) ?? []), a]);
    return map;
  }, [data]);

  if (overview.error) return <div className="mx-auto max-w-6xl"><ErrorState error={overview.error} /></div>;
  if (!data) {
    return (
      <div className="mx-auto max-w-6xl space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-24 w-full rounded-popover" />
        <Skeleton className="h-64 w-full rounded-popover" />
      </div>
    );
  }

  const refresh = () => invalidate();
  const act = async (result: Promise<{ status: ActionStatus; errorMessage?: string }>, done: string) => {
    const res = await result;
    if (res.status !== ActionStatus.SUCCESS) {
      showActionError(res);
      return false;
    }
    showSuccess(done);
    await refresh();
    return true;
  };

  const live = data.assignments.filter((a) => a.status === "OPEN" || a.status === "SUBMITTED");
  const submitted = live.filter((a) => a.status === "SUBMITTED").length;
  const overdue = live.filter((a) => a.status === "OPEN" && a.overdue).length;
  const c = data.cycle;
  const peerKind = c.kinds.find((k) => k.kind === "PEER");
  // Below this many peers, a person's anonymous peer reviews are never shown (Q1).
  const threshold = peerKind?.anonymous ? peerKind.anonymityThreshold ?? 3 : null;
  const managerShares = c.sharingMode === "MANAGER_SHARES";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <SettingsPageHeader title={c.name} backHref="/reviews" className="min-w-0 flex-1" />
        <CycleStatusBadge status={c.status} />
        {canManage && (
          <RowActionsMenu label={t("builder.actions")}>
            {active && (
              <RowAction icon={<Icon icon={CalendarLock01Icon} size="sm" className="text-tertiary" />} onClick={() => setEditingDates(true)}>
                {t("run.editDates")}
              </RowAction>
            )}
            {/* A new draft from this cycle, dates cleared or moved (REVIEWS_PLAN.md 11.1). */}
            <RowAction icon={<Icon icon={Copy01Icon} size="sm" className="text-tertiary" />} disabled={copies.busy}
              onClick={() => void copies.duplicate(c.id)}>
              {tCommon("actions.duplicate")}
            </RowAction>
            <RowAction icon={<Icon icon={CalendarAdd01Icon} size="sm" className="text-tertiary" />} onClick={() => setRepeating(true)}>
              {t("builder.repeat")}
            </RowAction>
            {active && (
              <RowActionDestructive icon={<Icon icon={SquareLock02Icon} size="sm" />} onClick={() => setConfirm({ kind: "close" })}>
                {t("run.closeCycle")}
              </RowActionDestructive>
            )}
          </RowActionsMenu>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Fact label={t("launch.fact.people")} value={String(data.people.filter((p) => p.status !== "REMOVED").length)} />
        <Fact label={t("run.fact.submitted")} value={t("run.ofTotal", { count: submitted, total: live.length })} />
        <Fact label={t("status.assignment.overdue")} value={String(overdue)} warn={overdue > 0} />
        <Fact label={t("status.participant.shared")} value={String(data.people.filter((p) => p.shared).length)} />
      </div>

      <Tabs defaultValue="people" className="w-full">
        <TabsList>
          <TabsTrigger value="people">{t("run.tabs.people")}</TabsTrigger>
          <TabsTrigger value="reviewers">{t("run.tabs.reviewers")}</TabsTrigger>
          <TabsTrigger value="calibration">{t("run.tabs.calibration")}</TabsTrigger>
          <TabsTrigger value="results">{t("builder.results.title")}</TabsTrigger>
          <TabsTrigger value="settings">{t("run.tabs.settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="mt-4">
          {data.people.length === 0 ? (
            <EmptyState compact scene="review-cycle" title={t("run.people.emptyTitle")}
              description={t("run.people.emptyDescription")} />
          ) : (
          <ul className="space-y-2">
            {data.people.map((p) => (
              <PersonCard key={p.participantId} person={p} reviews={byParticipant.get(p.participantId) ?? []}
                hasPeers={c.kinds.some((k) => k.kind === "PEER")} manage={manage} canReadResults={data.canReadResults}
                scale={c.scale} threshold={threshold} canShareOnBehalf={manage && managerShares}
                onShare={() => setConfirm({ kind: "share", person: p })}
                onChoosePeers={() => setPeersFor(p)}
                onRemove={() => setConfirm({ kind: "remove", person: p })}
                onReassign={(a) => setReassign({
                  assignmentId: a.id, kind: a.kind, subjectName: p.subject.name, reviewerName: a.reviewer.name,
                  suggestion: a.kind === "MANAGER" && p.currentManager
                    ? { id: p.currentManager.userId, firstName: p.currentManager.name } : null,
                })}
                onNudge={(a) => void act(nudgeReviewsAction([a.id]), t("run.reminderSent"))}
                onWithdraw={(a) => void act(withdrawReviewAction(a.id), t("run.withdrawn"))}
              />
            ))}
          </ul>
          )}
        </TabsContent>

        <TabsContent value="reviewers" className="mt-4">
          {data.reviewers.length === 0 ? (
            <EmptyState compact scene="all-caught-up" title={t("run.reviewers.emptyTitle")}
              description={t("run.reviewers.emptyDescription")} />
          ) : (
          <div className="overflow-x-auto rounded-popover border border-divider bg-card">
            <table className="w-full text-body">
              <thead className="text-left text-hint text-tertiary">
                <tr className="border-b border-divider">
                  <th className="px-4 py-2 font-medium">{t("run.reviewers.reviewer")}</th>
                  <th className="px-4 py-2 font-medium">{t("run.fact.submitted")}</th>
                  <th className="px-4 py-2 font-medium">{t("status.assignment.overdue")}</th>
                  <th className="px-4 py-2 font-medium">{t("run.reviewers.peerReviews")}</th>
                  <th className="px-4 py-2 font-medium">{t("run.reviewers.nextDue")}</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {data.reviewers.map((r) => {
                  const open = data.assignments.filter((a) => a.reviewer.userId === r.reviewer.userId && a.status === "OPEN");
                  return (
                    <tr key={r.reviewer.userId} className="border-b border-divider last:border-0">
                      <td className="px-4 py-2 text-primary">
                        {r.reviewer.name}
                        {r.leftCompany && <span className="ml-2 text-hint text-tertiary">{t("run.reviewers.left")}</span>}
                      </td>
                      <td className="px-4 py-2">{t("run.ofTotal", { count: r.submitted, total: r.total })}</td>
                      <td className={`px-4 py-2 ${r.overdue > 0 ? "text-status-pending-text" : ""}`}>{r.overdue}</td>
                      <td className="px-4 py-2">{r.peerReviews}</td>
                      <td className="px-4 py-2">{r.nearestDueOn ? formatDisplayDate(r.nearestDueOn, { style: "medium" }) : "—"}</td>
                      <td className="px-4 py-2 text-right">
                        {manage && open.length > 0 && (
                          <RowActionsMenu label={t("run.reviewers.actions")}>
                            <RowAction icon={<Icon icon={Notification01Icon} size="sm" className="text-tertiary" />}
                              onClick={() => void act(nudgeReviewsAction(open.map((a) => a.id)), t("run.reminderSent"))}>
                              {t("run.sendReminder")}
                            </RowAction>
                          </RowActionsMenu>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </TabsContent>

        <TabsContent value="calibration" className="mt-4">
          <CalibrationSessionsTab cycleId={c.id} canAdd={manage} />
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          <CycleResultsTab cycleId={c.id} cycleName={c.name} canExport={canManage} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SettingsView overview={data} />
        </TabsContent>
      </Tabs>

      <RepeatCycleDialog cycle={c} open={repeating} onCloseAction={() => setRepeating(false)} />
      <ChoosePeersDialog person={peersFor} open={peersFor !== null} onCloseAction={() => setPeersFor(null)}
        onDoneAction={async () => { setPeersFor(null); await refresh(); }} />
      <ReassignDialog target={reassign} open={reassign !== null} onCloseAction={() => setReassign(null)}
        onDoneAction={async () => { setReassign(null); await refresh(); }} />
      <EditDatesDialog cycle={c} open={editingDates} onCloseAction={() => setEditingDates(false)}
        onDoneAction={async () => { setEditingDates(false); await refresh(); }} />

      <ConfirmDialog
        open={confirm?.kind === "close"}
        title={t("run.closeCycle")}
        confirmLabel={t("run.closeCycle")}
        destructive
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          const res = await closeCycleAction(c.id);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
          setConfirm(null);
          await refresh();
          router.refresh();
          return null;
        }}
      >
        <p>
          {t("run.closeBody", { count: live.length - submitted })}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm?.kind === "share"}
        title={t("packet.shareOnBehalf")}
        confirmLabel={t("packet.shareDialog.confirm")}
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          if (confirm?.kind !== "share") return null;
          const res = await shareReviewAction(confirm.person.participantId);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
          setConfirm(null);
          showSuccess(t("packet.shareDialog.done"));
          await refresh();
          return null;
        }}
      >
        <p>
          {confirm?.kind === "share" && t("run.shareBody", {
            subject: confirm.person.subject.name,
            hasManager: confirm.person.manager ? "yes" : "no",
            manager: confirm.person.manager?.name ?? "",
          })}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm?.kind === "remove"}
        title={t("run.removeFromCycle")}
        confirmLabel={tCommon("actions.remove")}
        destructive
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          if (confirm?.kind !== "remove") return null;
          const res = await removeParticipantAction(confirm.person.participantId);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
          setConfirm(null);
          await refresh();
          return null;
        }}
      >
        <p>
          {confirm?.kind === "remove" && t("run.removeBody", { name: confirm.person.subject.name })}
        </p>
      </ConfirmDialog>
    </div>
  );
}

function Fact({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-card border border-divider bg-card px-5 py-3">
      <div className="text-hint text-tertiary">{label}</div>
      <div className={`text-section-title ${warn ? "text-status-pending-text" : "text-primary"}`}>{value}</div>
    </div>
  );
}

function PersonCard({
  person: p, reviews, hasPeers, manage, canReadResults, scale, threshold, canShareOnBehalf, onShare, onChoosePeers, onRemove,
  onReassign, onNudge, onWithdraw,
}: {
  person: PersonRow;
  reviews: AssignmentRow[];
  hasPeers: boolean;
  manage: boolean;
  canReadResults: boolean;
  scale: CycleOverview["cycle"]["scale"];
  /** The anonymity threshold when peer reviews are anonymous, else null. */
  threshold: number | null;
  canShareOnBehalf: boolean;
  onShare: () => void;
  onChoosePeers: () => void;
  onRemove: () => void;
  onReassign: (a: AssignmentRow) => void;
  onNudge: (a: AssignmentRow) => void;
  onWithdraw: (a: AssignmentRow) => void;
}) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const removed = p.status === "REMOVED";
  const shown = shownReviews(reviews);
  const rating = p.finalRating != null ? scale.find((s) => s.value === p.finalRating)?.label : null;
  const belowThreshold = hasPeers && !removed && threshold != null && p.peers < threshold;
  // A manager review waiting for its approver is not shared by anybody (REVIEWS_PLAN.md 10.3).
  const shareable = canShareOnBehalf && !removed && p.managerReviewIn && !p.shared && (p.approver == null || p.approvedAt != null);
  return (
    <li className={`rounded-card border border-divider bg-card px-5 py-4 ${removed ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-primary">{p.subject.name}</span>
        <PacketStatusBadge status={p.status} />
        {p.leftCompany && <span className="text-hint text-tertiary">{t("run.person.leftCompany")}</span>}
        <span className="text-hint text-tertiary">
          {p.manager ? t("run.person.manager", { name: p.manager.name }) : t("run.person.noManager")}
        </span>
        {p.managerChanged && !removed && (
          <span className="flex items-center gap-1 text-hint text-status-pending-text">
            <Icon icon={Alert02Icon} size="sm" />
            {p.currentManager ? t("run.person.managerChangedTo", { name: p.currentManager.name }) : t("run.person.managerChanged")}
          </span>
        )}
        {belowThreshold && (
          <span className="flex items-center gap-1 text-hint text-status-pending-text" data-test="below-threshold">
            <Icon icon={ViewOffSlashIcon} size="sm" />
            {t("run.person.belowThreshold", { threshold: threshold ?? 0 })}
          </span>
        )}
        {canReadResults && p.finalRating != null && (
          <span className="text-hint text-tertiary">
            {[
              t("run.person.rating", { rating: p.finalRating }),
              rating,
              p.calibrated ? t("run.person.calibrated") : null,
            ].filter(Boolean).join(" · ")}
          </span>
        )}
        {p.approver && !removed && (
          <span className="text-hint text-tertiary">
            {p.approvedAt ? t("run.person.approvedBy", { name: p.approver.name })
              : p.status === "AWAITING_APPROVAL" ? t("run.person.waitingApproval", { name: p.approver.name }) : ""}
          </span>
        )}
        {p.nominationStatus && !removed && (
          <span className={`text-hint ${p.nominationStatus === "APPROVED" ? "text-tertiary" : "text-status-pending-text"}`}
            data-test="nomination-status">
            {p.nominationStatus === "AWAITING_APPROVAL"
              ? t("run.person.nominationWithCount", { status: t(REVIEW_NOMINATION_STATUS_KEYS[p.nominationStatus]), count: p.nominatedPeers })
              : t("run.person.nomination", { status: t(REVIEW_NOMINATION_STATUS_KEYS[p.nominationStatus]) })}
          </span>
        )}
        {p.upwardReviews > 0 && !removed && (
          <span className="text-hint text-tertiary">{t("run.person.upward", { count: p.upwardReviews })}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {hasPeers && !removed && (
            <span className={`text-hint ${p.peerMin != null && p.peers < p.peerMin ? "text-status-pending-text" : "text-tertiary"}`}>
              {t("run.person.peers", { count: p.peers, min: p.peerMin ?? 0, max: p.peerMax ?? 0 })}
            </span>
          )}
          {(canReadResults || p.managerReviewIn) && (
            <Link href={`/reviews/packets/${p.participantId}`} className="text-hint text-accent-text underline-offset-4 hover:underline">
              {tCommon("actions.open")}
            </Link>
          )}
          {manage && !removed && (
            <RowActionsMenu label={t("run.person.actions")}>
              {hasPeers && (
                <RowAction icon={<Icon icon={UserAdd01Icon} size="sm" className="text-tertiary" />} onClick={onChoosePeers}>
                  {t("run.choosePeers")}
                </RowAction>
              )}
              {shareable && (
                <RowAction icon={<Icon icon={SentIcon} size="sm" className="text-tertiary" />} onClick={onShare}>
                  {t("packet.shareOnBehalf")}
                </RowAction>
              )}
              <RowActionDestructive icon={<Icon icon={UserRemove01Icon} size="sm" />} onClick={onRemove}>
                {t("run.removeFromCycle")}
              </RowActionDestructive>
            </RowActionsMenu>
          )}
        </div>
      </div>

      {shown.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {shown.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-control border border-divider px-3 py-1.5 text-hint">
              <span className="text-tertiary">{t(REVIEW_KIND_KEYS[a.kind])}</span>
              <span className="text-primary">{a.reviewer.name}</span>
              <AssignmentStatusBadge status={a.status} overdue={a.overdue} />
              {manage && a.status === "OPEN" && (
                <RowActionsMenu label={t("run.person.reviewActions")}>
                  <RowAction icon={<Icon icon={Notification01Icon} size="sm" className="text-tertiary" />} onClick={() => onNudge(a)}>
                    {t("run.sendReminder")}
                  </RowAction>
                  {a.kind !== "SELF" && (
                    <RowAction icon={<Icon icon={RepeatIcon} size="sm" className="text-tertiary" />} onClick={() => onReassign(a)}>
                      {t("run.handOn")}
                    </RowAction>
                  )}
                  {a.kind === "PEER" && (
                    <RowActionDestructive icon={<Icon icon={Undo02Icon} size="sm" />} onClick={() => onWithdraw(a)}>
                      {t("run.withdraw")}
                    </RowActionDestructive>
                  )}
                </RowActionsMenu>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function SettingsView({ overview }: { overview: CycleOverview }) {
  const t = useTranslations("reviews");
  const formatDisplayDate = useDateFormatter();
  const c = overview.cycle;
  const medium = (iso: string) => formatDisplayDate(iso, { style: "medium" });
  return (
    <div className="space-y-4 rounded-card border border-divider bg-card p-5 text-body">
      {c.description && <p className="text-tertiary">{c.description}</p>}
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Row label={t("run.settings.launched")}>{c.launchedAt ? formatDisplayDate(c.launchedAt, { style: "medium" }) : "—"}</Row>
        <Row label={t("run.settings.runBy")}>{c.ownerName ?? "—"}</Row>
        <Row label={t("copies.date.hiredBefore")}>{c.eligibleHiredBefore ? medium(c.eligibleHiredBefore) : t("run.settings.anybody")}</Row>
        <Row label={t("builder.results.title")}>
          {c.sharingMode === "RELEASED_ON_DATE" && c.releaseDate
            ? t("run.settings.sharingOn", { mode: t(REVIEW_SHARING_KEYS[c.sharingMode]), date: medium(c.releaseDate) })
            : t(REVIEW_SHARING_KEYS[c.sharingMode])}
        </Row>
      </dl>
      <div>
        <h3 className="mb-2 font-medium text-primary">{t("builder.reviews.title")}</h3>
        {c.approvalMode !== "NONE" && (
          <p className="text-tertiary">
            {t("run.settings.approvedBy", {
              mode: c.approvalMode,
              name: c.approverName ?? "",
              hasName: c.approverName ? "yes" : "no",
            })}
          </p>
        )}
        <ul className="space-y-1">
          {c.kinds.map((k) => (
            <li key={k.kind} className="flex flex-wrap items-center gap-x-2">
              <Icon icon={FileSearchIcon} size="sm" className="text-tertiary" />
              <span className="font-medium">{t(REVIEW_KIND_KEYS[k.kind])}</span>
              <span className="text-tertiary">
                {[
                  k.formName ?? t("run.settings.noForm"),
                  t("run.settings.questions", { count: k.questionCount }),
                  k.opensOn ? t("run.settings.opens", { date: medium(k.opensOn) }) : null,
                  k.dueOn ? t("write.due", { date: medium(k.dueOn) }) : null,
                  k.kind === "PEER" ? t("run.settings.peerRange", { min: k.peerMin ?? 0, max: k.peerMax ?? 0 }) : null,
                  (k.kind === "PEER" && k.anonymous) || k.kind === "UPWARD"
                    ? t("run.settings.anonymousShown", { threshold: k.anonymityThreshold ?? 3 }) : null,
                  k.kind === "PEER" && k.peerMode === "SUBJECT_NOMINATES"
                    ? t("run.settings.nominated", {
                      hasNomination: k.nominationDueOn ? "yes" : "no",
                      nomination: k.nominationDueOn ? medium(k.nominationDueOn) : "",
                      hasApproval: k.approvalDueOn ? "yes" : "no",
                      approval: k.approvalDueOn ? medium(k.approvalDueOn) : "",
                    })
                    : null,
                ].filter(Boolean).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-medium text-primary">{t("builder.scale.title")}</h3>
        <ol className="flex flex-wrap gap-2">
          {c.scale.map((s) => (
            <li key={s.value} className="rounded-control border border-divider px-3 py-1.5">
              <span className="font-semibold">{s.value}</span> · {s.label}
            </li>
          ))}
        </ol>
      </div>
      <p className="text-hint text-tertiary">
        {t("run.settings.lockedNote")}
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-hint text-tertiary">{label}</dt>
      <dd className="text-primary">{children}</dd>
    </div>
  );
}
