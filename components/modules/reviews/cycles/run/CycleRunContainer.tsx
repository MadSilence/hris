"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { formatDisplayDate } from "@/lib/date";
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
  REVIEW_APPROVAL_MODE_LABELS,
  REVIEW_KIND_LABELS,
  REVIEW_NOMINATION_STATUS_LABELS,
  REVIEW_SHARING_LABEL,
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
          <RowActionsMenu label="Cycle actions">
            {active && (
              <RowAction icon={<Icon icon={CalendarLock01Icon} size="sm" className="text-tertiary" />} onClick={() => setEditingDates(true)}>
                Edit dates
              </RowAction>
            )}
            {/* A new draft from this cycle, dates cleared or moved (REVIEWS_PLAN.md 11.1). */}
            <RowAction icon={<Icon icon={Copy01Icon} size="sm" className="text-tertiary" />} disabled={copies.busy}
              onClick={() => void copies.duplicate(c.id)}>
              Duplicate
            </RowAction>
            <RowAction icon={<Icon icon={CalendarAdd01Icon} size="sm" className="text-tertiary" />} onClick={() => setRepeating(true)}>
              Repeat…
            </RowAction>
            {active && (
              <RowActionDestructive icon={<Icon icon={SquareLock02Icon} size="sm" />} onClick={() => setConfirm({ kind: "close" })}>
                Close cycle
              </RowActionDestructive>
            )}
          </RowActionsMenu>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Fact label="People" value={String(data.people.filter((p) => p.status !== "REMOVED").length)} />
        <Fact label="Submitted" value={`${submitted} of ${live.length}`} />
        <Fact label="Overdue" value={String(overdue)} warn={overdue > 0} />
        <Fact label="Shared" value={String(data.people.filter((p) => p.shared).length)} />
      </div>

      <Tabs defaultValue="people" className="w-full">
        <TabsList>
          <TabsTrigger value="people">By person</TabsTrigger>
          <TabsTrigger value="reviewers">By reviewer</TabsTrigger>
          <TabsTrigger value="calibration">Calibration</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="mt-4">
          {data.people.length === 0 ? (
            <EmptyState compact scene="team-and-org" title="Nobody takes part"
              description="Everybody who took part has been removed from this cycle." />
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
                onNudge={(a) => void act(nudgeReviewsAction([a.id]), "Reminder sent.")}
                onWithdraw={(a) => void act(withdrawReviewAction(a.id), "Review withdrawn.")}
              />
            ))}
          </ul>
          )}
        </TabsContent>

        <TabsContent value="reviewers" className="mt-4">
          {data.reviewers.length === 0 ? (
            <EmptyState compact scene="team-and-org" title="Nobody has a review to write"
              description="A reviewer appears here once the cycle asks them to write — peers once they are chosen." />
          ) : (
          <div className="overflow-x-auto rounded-popover border border-divider bg-card">
            <table className="w-full text-body">
              <thead className="text-left text-hint text-tertiary">
                <tr className="border-b border-divider">
                  <th className="px-4 py-2 font-medium">Reviewer</th>
                  <th className="px-4 py-2 font-medium">Submitted</th>
                  <th className="px-4 py-2 font-medium">Overdue</th>
                  <th className="px-4 py-2 font-medium">Peer reviews</th>
                  <th className="px-4 py-2 font-medium">Next due</th>
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
                        {r.leftCompany && <span className="ml-2 text-hint text-tertiary">Left</span>}
                      </td>
                      <td className="px-4 py-2">{r.submitted} of {r.total}</td>
                      <td className={`px-4 py-2 ${r.overdue > 0 ? "text-status-pending-text" : ""}`}>{r.overdue}</td>
                      <td className="px-4 py-2">{r.peerReviews}</td>
                      <td className="px-4 py-2">{r.nearestDueOn ? formatDisplayDate(r.nearestDueOn, { style: "medium" }) : "—"}</td>
                      <td className="px-4 py-2 text-right">
                        {manage && open.length > 0 && (
                          <RowActionsMenu label="Reviewer actions">
                            <RowAction icon={<Icon icon={Notification01Icon} size="sm" className="text-tertiary" />}
                              onClick={() => void act(nudgeReviewsAction(open.map((a) => a.id)), "Reminder sent.")}>
                              Send a reminder
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
        title="Close cycle"
        confirmLabel="Close cycle"
        destructive
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          const res = await closeCycleAction(c.id);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setConfirm(null);
          await refresh();
          router.refresh();
          return null;
        }}
      >
        <p>
          Reviews not yet submitted ({live.length - submitted}) are withdrawn and their tasks cancelled. What was written
          stays, and shared reviews stay readable. A closed cycle cannot be reopened.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm?.kind === "share"}
        title="Share on the manager's behalf"
        confirmLabel="Share"
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          if (confirm?.kind !== "share") return null;
          const res = await shareReviewAction(confirm.person.participantId);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setConfirm(null);
          showSuccess("Review shared.");
          await refresh();
          return null;
        }}
      >
        <p>
          {confirm?.kind === "share" ? confirm.person.subject.name : ""} will read the manager review
          {confirm?.kind === "share" && confirm.person.manager ? ` by ${confirm.person.manager.name}` : ""}, their self
          review and the rating, and is told as if the manager had shared it. The journal records that you shared it on
          the manager&apos;s behalf. A shared review cannot be unshared.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm?.kind === "remove"}
        title="Remove from cycle"
        confirmLabel="Remove"
        destructive
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          if (confirm?.kind !== "remove") return null;
          const res = await removeParticipantAction(confirm.person.participantId);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setConfirm(null);
          await refresh();
          return null;
        }}
      >
        <p>
          {confirm?.kind === "remove" ? confirm.person.subject.name : ""} is no longer reviewed in this cycle. Reviews about
          them that are not in yet are withdrawn; what was written stays.
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
        {p.leftCompany && <span className="text-hint text-tertiary">Left the company</span>}
        <span className="text-hint text-tertiary">
          {p.manager ? `Manager in this cycle: ${p.manager.name}` : "No manager review"}
        </span>
        {p.managerChanged && !removed && (
          <span className="flex items-center gap-1 text-hint text-status-pending-text">
            <Icon icon={Alert02Icon} size="sm" />
            Manager changed since launch{p.currentManager ? ` — now ${p.currentManager.name}` : ""}
          </span>
        )}
        {belowThreshold && (
          <span className="flex items-center gap-1 text-hint text-status-pending-text" data-test="below-threshold">
            <Icon icon={ViewOffSlashIcon} size="sm" />
            Fewer peers than the anonymity threshold of {threshold} — their reviews stay hidden
          </span>
        )}
        {canReadResults && p.finalRating != null && (
          <span className="text-hint text-tertiary">
            Rating: {p.finalRating}{rating ? ` · ${rating}` : ""}{p.calibrated ? " · calibrated" : ""}
          </span>
        )}
        {p.approver && !removed && (
          <span className="text-hint text-tertiary">
            {p.approvedAt ? `Approved by ${p.approver.name}` : p.status === "AWAITING_APPROVAL" ? `Waiting for approval by ${p.approver.name}` : ""}
          </span>
        )}
        {p.nominationStatus && !removed && (
          <span className={`text-hint ${p.nominationStatus === "APPROVED" ? "text-tertiary" : "text-status-pending-text"}`}
            data-test="nomination-status">
            Peers: {REVIEW_NOMINATION_STATUS_LABELS[p.nominationStatus]}
            {p.nominationStatus === "AWAITING_APPROVAL" ? ` (${p.nominatedPeers} nominated)` : ""}
          </span>
        )}
        {p.upwardReviews > 0 && !removed && (
          <span className="text-hint text-tertiary">Upward {p.upwardReviews}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {hasPeers && !removed && (
            <span className={`text-hint ${p.peerMin != null && p.peers < p.peerMin ? "text-status-pending-text" : "text-tertiary"}`}>
              Peers {p.peers}/{p.peerMin}–{p.peerMax}
            </span>
          )}
          {(canReadResults || p.managerReviewIn) && (
            <Link href={`/reviews/packets/${p.participantId}`} className="text-hint text-accent-text underline-offset-4 hover:underline">
              Open
            </Link>
          )}
          {manage && !removed && (
            <RowActionsMenu label="Person actions">
              {hasPeers && (
                <RowAction icon={<Icon icon={UserAdd01Icon} size="sm" className="text-tertiary" />} onClick={onChoosePeers}>
                  Choose peers
                </RowAction>
              )}
              {shareable && (
                <RowAction icon={<Icon icon={SentIcon} size="sm" className="text-tertiary" />} onClick={onShare}>
                  Share on the Manager&apos;s Behalf
                </RowAction>
              )}
              <RowActionDestructive icon={<Icon icon={UserRemove01Icon} size="sm" />} onClick={onRemove}>
                Remove from cycle
              </RowActionDestructive>
            </RowActionsMenu>
          )}
        </div>
      </div>

      {shown.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {shown.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-control border border-divider px-3 py-1.5 text-hint">
              <span className="text-tertiary">{REVIEW_KIND_LABELS[a.kind]}</span>
              <span className="text-primary">{a.reviewer.name}</span>
              <AssignmentStatusBadge status={a.status} overdue={a.overdue} />
              {manage && a.status === "OPEN" && (
                <RowActionsMenu label="Review actions">
                  <RowAction icon={<Icon icon={Notification01Icon} size="sm" className="text-tertiary" />} onClick={() => onNudge(a)}>
                    Send a reminder
                  </RowAction>
                  {a.kind !== "SELF" && (
                    <RowAction icon={<Icon icon={RepeatIcon} size="sm" className="text-tertiary" />} onClick={() => onReassign(a)}>
                      Hand to someone else
                    </RowAction>
                  )}
                  {a.kind === "PEER" && (
                    <RowActionDestructive icon={<Icon icon={Undo02Icon} size="sm" />} onClick={() => onWithdraw(a)}>
                      Withdraw
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
  const c = overview.cycle;
  return (
    <div className="space-y-4 rounded-card border border-divider bg-card p-5 text-body">
      {c.description && <p className="text-tertiary">{c.description}</p>}
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Row label="Launched">{c.launchedAt ? formatDisplayDate(c.launchedAt, { style: "medium" }) : "—"}</Row>
        <Row label="Run by">{c.ownerName ?? "—"}</Row>
        <Row label="Hired on or before">{c.eligibleHiredBefore ? formatDisplayDate(c.eligibleHiredBefore, { style: "medium" }) : "Anybody"}</Row>
        <Row label="Results">
          {REVIEW_SHARING_LABEL[c.sharingMode]}
          {c.sharingMode === "RELEASED_ON_DATE" && c.releaseDate ? ` — ${formatDisplayDate(c.releaseDate, { style: "medium" })}` : ""}
        </Row>
      </dl>
      <div>
        <h3 className="mb-2 font-medium text-primary">Reviews</h3>
        {c.approvalMode !== "NONE" && (
          <p className="text-tertiary">
            Manager reviews are approved by {c.approvalMode === "PERSON" ? c.approverName ?? "a named person" : REVIEW_APPROVAL_MODE_LABELS[c.approvalMode].toLowerCase()} before they are shared.
          </p>
        )}
        <ul className="space-y-1">
          {c.kinds.map((k) => (
            <li key={k.kind} className="flex flex-wrap items-center gap-x-2">
              <Icon icon={FileSearchIcon} size="sm" className="text-tertiary" />
              <span className="font-medium">{REVIEW_KIND_LABELS[k.kind]}</span>
              <span className="text-tertiary">
                {k.formName ?? "No form"} · {k.questionCount} questions
                {k.opensOn ? ` · opens ${formatDisplayDate(k.opensOn, { style: "medium" })}` : ""}
                {k.dueOn ? ` · due ${formatDisplayDate(k.dueOn, { style: "medium" })}` : ""}
                {k.kind === "PEER"
                  ? ` · ${k.peerMin}–${k.peerMax} peers${k.anonymous ? ` · anonymous, shown once ${k.anonymityThreshold ?? 3} are in` : ""}`
                  : ""}
                {k.kind === "PEER" && k.peerMode === "SUBJECT_NOMINATES"
                  ? ` · nominated by the person${k.nominationDueOn ? ` by ${formatDisplayDate(k.nominationDueOn, { style: "medium" })}` : ""}${
                    k.approvalDueOn ? `, approved by ${formatDisplayDate(k.approvalDueOn, { style: "medium" })}` : ""}`
                  : ""}
                {k.kind === "UPWARD" ? ` · anonymous, shown once ${k.anonymityThreshold ?? 3} are in` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-medium text-primary">Rating scale</h3>
        <ol className="flex flex-wrap gap-2">
          {c.scale.map((s) => (
            <li key={s.value} className="rounded-control border border-divider px-3 py-1.5">
              <span className="font-semibold">{s.value}</span> · {s.label}
            </li>
          ))}
        </ol>
      </div>
      <p className="text-hint text-tertiary">
        A launched cycle keeps its forms, kinds, scale and anonymity; only the dates change, from Edit Dates.
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
