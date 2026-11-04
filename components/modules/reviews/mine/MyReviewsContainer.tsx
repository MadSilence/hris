"use client";

import React from "react";
import Link from "next/link";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import type { Scene } from "@/components/illustrations";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
import { useMyReviews } from "@/components/modules/reviews/hooks";
import { AssignmentStatusBadge, PacketStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import {
  REVIEW_KIND_LABELS,
  REVIEW_STEP_LABELS,
  stepHref,
  type MyAssignment,
  type StepRow,
  type TeamRow,
} from "@/models/reviews";

/**
 * Reviews → My Reviews (REVIEWS_DESIGN.md § 12.6): what I am asked to write, what was shared with me, and — when I
 * manage somebody in a cycle — my people, with Share once my review of them is in. Above them, the steps waiting for me:
 * peers to nominate or approve, manager reviews to approve (REVIEWS_PLAN.md 10.2–10.3).
 */
export function MyReviewsContainer() {
  const mine = useMyReviews();
  if (mine.error) return <ErrorState error={mine.error} />;
  if (!mine.data) return <Skeleton className="h-64 w-full rounded-popover" aria-busy="true" />;
  const { toWrite, written, aboutMe, team } = mine.data;
  const steps = mine.data.steps ?? [];

  if (toWrite.length + written.length + aboutMe.length + team.length + steps.length === 0) {
    return (
      <EmptyState
        scene="reviews-and-one-on-ones"
        title="No reviews for you yet"
        description="When a review cycle asks you to write a review, it appears here and in your Tasks. Reviews shared with you appear here too."
      />
    );
  }

  return (
    <div className="space-y-8">
      {steps.length > 0 && (
        <Section title="To do">
          {steps.map((s) => <StepLine key={`${s.kind}-${s.participantId}`} s={s} />)}
        </Section>
      )}

      <Section
        title="To write"
        empty={{
          scene: "all-caught-up",
          title: "All caught up",
          description: "Nothing to write right now. A new review appears here and in your Tasks.",
        }}
      >
        {toWrite.map((a) => <AssignmentLine key={a.id} a={a} />)}
      </Section>

      {team.length > 0 && (
        <Section title="My team">
          {team.map((r) => <TeamLine key={r.participantId} r={r} />)}
        </Section>
      )}

      <Section
        title="About me"
        empty={{
          scene: "reviews-and-one-on-ones",
          title: "Nothing shared with you yet",
          description: "Once your review is shared with you, you read it and acknowledge it here.",
        }}
      >
        {aboutMe.map((p) => (
          <li key={p.participantId}>
            <Link href={`/reviews/packets/${p.participantId}`}
              className="flex flex-wrap items-center gap-3 rounded-card border border-divider bg-card px-5 py-3 no-underline hover:border-divider hover:bg-subtle/40">
              <span className="font-medium text-primary">{p.cycleName}</span>
              <PacketStatusBadge status={p.status} />
              {p.finalRating != null && (
                <span className="text-body text-tertiary">Rating {p.finalRating}{p.finalRatingLabel ? ` · ${p.finalRatingLabel}` : ""}</span>
              )}
              <span className="ml-auto text-hint text-tertiary">
                {p.acknowledgedAt ? `Acknowledged ${formatDisplayDate(p.acknowledgedAt, { style: "medium" })}`
                  : p.sharedAt ? `Shared ${formatDisplayDate(p.sharedAt, { style: "medium" })} — waiting for you to acknowledge` : ""}
              </span>
            </Link>
          </li>
        ))}
      </Section>

      {written.length > 0 && (
        <Section title="Written">
          {written.map((a) => <AssignmentLine key={a.id} a={a} />)}
        </Section>
      )}
    </div>
  );
}

type SectionEmpty = { scene: Scene; title: string; description: string };

function Section({ title, empty, children }: { title: string; empty?: SectionEmpty; children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  if (items.length === 0 && !empty) return null;
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-section-title text-primary">
        {title}
        {items.length > 0 && (
          <span className="rounded-pill bg-subtle px-2 py-0.5 text-hint font-medium text-secondary">{items.length}</span>
        )}
      </h2>
      {items.length === 0 && empty
        ? <EmptyState compact scene={empty.scene} title={empty.title} description={empty.description} />
        : <ul className="space-y-2">{items}</ul>}
    </section>
  );
}

function StepLine({ s }: { s: StepRow }) {
  const about = s.kind === "NOMINATE_PEERS" ? "For your review" : `For ${s.subject.name}`;
  return (
    <li>
      <Link href={stepHref(s.kind, s.participantId)}
        className="flex flex-wrap items-center gap-3 rounded-card border border-divider bg-card px-5 py-3 no-underline hover:border-divider hover:bg-subtle/40">
        <span className="font-medium text-primary">{REVIEW_STEP_LABELS[s.kind]}</span>
        <span className="text-body text-primary">{about}</span>
        {s.overdue && <AssignmentStatusBadge status="OPEN" overdue />}
        <span className="ml-auto text-hint text-tertiary">
          {s.cycleName}
          {s.dueOn ? ` · due ${formatDisplayDate(s.dueOn, { style: "medium" })}` : ""}
        </span>
      </Link>
    </li>
  );
}

function AssignmentLine({ a }: { a: MyAssignment }) {
  const about = a.kind === "SELF" ? "About yourself" : a.kind === "UPWARD" ? `Your manager, ${a.subject.name}` : `About ${a.subject.name}`;
  return (
    <li>
      <Link href={`/reviews/write/${a.id}`}
        className="flex flex-wrap items-center gap-3 rounded-card border border-divider bg-card px-5 py-3 no-underline hover:border-divider hover:bg-subtle/40">
        <span className="font-medium text-primary">{REVIEW_KIND_LABELS[a.kind]}</span>
        <span className="text-body text-primary">{about}</span>
        <AssignmentStatusBadge status={a.status} overdue={a.overdue} />
        <span className="ml-auto text-hint text-tertiary">
          {a.cycleName}
          {a.status === "OPEN" && a.dueOn ? ` · due ${formatDisplayDate(a.dueOn, { style: "medium" })}` : ""}
          {a.status === "SUBMITTED" && a.submittedAt ? ` · submitted ${formatDisplayDate(a.submittedAt, { style: "medium" })}` : ""}
        </span>
      </Link>
    </li>
  );
}

function TeamLine({ r }: { r: TeamRow }) {
  const ready = r.managerStatus === "SUBMITTED" && !r.shared && r.sharingMode === "MANAGER_SHARES" && r.cycleStatus === "ACTIVE";
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-card border border-divider bg-card px-5 py-3">
      <span className="font-medium text-primary">{r.subject.name}</span>
      <span className="text-hint text-tertiary">{r.cycleName}</span>
      <span className="flex flex-wrap items-center gap-3 text-hint text-tertiary">
        {r.selfStatus && <Progress label="Self" done={r.selfStatus === "SUBMITTED"} />}
        {r.peersTotal > 0 && (
          <Progress label={`Peers ${r.peersSubmitted}/${r.peersTotal}`} done={r.peersSubmitted === r.peersTotal} />
        )}
        {r.managerStatus && <Progress label="Yours" done={r.managerStatus === "SUBMITTED"} />}
      </span>
      <PacketStatusBadge status={r.packetStatus} />
      <div className="ml-auto flex items-center gap-3 text-body">
        {r.managerStatus === "OPEN" && r.managerAssignmentId && (
          <Link href={`/reviews/write/${r.managerAssignmentId}`} className="text-accent-text underline-offset-4 hover:underline">Write your review</Link>
        )}
        <Link href={`/reviews/packets/${r.participantId}`} className="text-accent-text underline-offset-4 hover:underline">
          {ready ? "Review and share" : "Open"}
        </Link>
      </div>
    </li>
  );
}

/** One review of a team member's packet: a filled mark once it is in, a hollow ring while it is not. */
function Progress({ label, done }: { label: string; done: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={done ? `${label}: in` : `${label}: not yet`}>
      <span className={cn(
        "grid h-3.5 w-3.5 place-items-center rounded-pill",
        done ? "bg-status-approved-fill text-on-accent" : "border border-field",
      )}>
        {done && <Icon icon={Tick02Icon} />}
      </span>
      {label}
    </span>
  );
}
