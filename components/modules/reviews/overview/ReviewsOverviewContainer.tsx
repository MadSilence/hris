"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Add01Icon, ArrowDown01Icon, FileAddIcon, Layout01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";
import { formatDisplayDate } from "@/lib/date";
import { useReviewCycles, useReviewCycleTemplates } from "@/components/modules/reviews/hooks";
import { useCycleCopies } from "@/components/modules/reviews/cycles/CycleCopyActions";
import { CycleStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import { REVIEW_KIND_LABELS, type CycleSummary } from "@/models/reviews";

export const cycleHref = (id: string) => `/reviews/cycles/${id}`;

/**
 * Reviews → Overview: every review cycle, each with how far along it is (REVIEWS_DESIGN.md § 12.2), and below them the
 * templates cycles are started from (REVIEWS_PLAN.md 11.2). Somebody who does not run cycles has nothing here and is
 * sent to My Reviews.
 */
export function ReviewsOverviewContainer() {
  const router = useRouter();
  const { access, loading } = useAccess();
  const canView = canAccess({ access, resource: "REVIEWS.CYCLE", action: "VIEW" });
  const [query, setQuery] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const { data, isLoading, error } = useReviewCycles(canView);
  const templates = useReviewCycleTemplates(canView);
  const copies = useCycleCopies();

  useEffect(() => {
    if (!loading && access && !canView) router.replace("/reviews/me");
  }, [loading, access, canView, router]);

  const all = useMemo(() => data ?? [], [data]);
  const closedCount = all.filter((c) => c.status === "CLOSED").length;
  const rows = all
    .filter((c) => (c.status === "CLOSED") === showClosed)
    .filter((c) => !query.trim() || c.name.toLowerCase().includes(query.trim().toLowerCase()));

  if (!canView) return null;

  return (
    <div className="space-y-4">
      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        archived={closedCount > 0 ? { count: closedCount, showing: showClosed, onChange: setShowClosed } : undefined}
        primary={
          <PermissionGate resource="REVIEWS.CYCLE" action="MANAGE">
            <AddCycleButton templates={templates.data ?? []} busy={copies.busy}
              onBlank={() => router.push("/reviews/cycles/new")}
              onTemplate={(id) => void copies.startFromTemplate(id)} />
          </PermissionGate>
        }
      />

      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <ul className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex h-[76px] items-center gap-4 rounded-card border border-divider px-5">
              <div className="h-4 w-56 shimmer rounded-tag bg-mist" />
              <div className="ml-auto h-3 w-32 shimmer rounded-tag bg-mist" />
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <ListEmptyState
          query={query}
          archivedView={showClosed}
          scene="reviews-and-one-on-ones"
          title="No review cycles yet"
          description="A cycle asks a group of people to review themselves and each other, and their managers to review them, on dates you set."
          archivedDescription="No closed review cycles."
          onCreate={() => router.push("/reviews/cycles/new")}
          createLabel="Add cycle"
          createAccess={{ resource: "REVIEWS.CYCLE", action: "MANAGE" }}
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => <CycleRow key={c.id} cycle={c} onOpen={() => router.push(cycleHref(c.id))} />)}
        </ul>
      )}

      {!showClosed && !query.trim() && (templates.data ?? []).length > 0 && (
        <section className="space-y-2 pt-4" aria-labelledby="review-templates">
          <h2 id="review-templates" className="text-body font-medium text-primary">Templates</h2>
          <p className="text-hint text-tertiary">
            Never launched themselves: a cycle is added from one, or an automation starts one for a person.
          </p>
          <ul className="space-y-2">
            {(templates.data ?? []).map((t) => (
              <CycleRow key={t.id} cycle={t} onOpen={() => router.push(cycleHref(t.id))} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * "Add Cycle": straight to a blank cycle while there are no templates; with templates, a menu offers a blank one or
 * a draft copied from a template (11.2).
 */
function AddCycleButton({ templates, busy, onBlank, onTemplate }: {
  templates: CycleSummary[];
  busy: boolean;
  onBlank: () => void;
  onTemplate: (id: string) => void;
}) {
  if (templates.length === 0) {
    return (
      <Button type="button" className="gap-1.5" onClick={onBlank}>
        <Icon icon={Add01Icon} size="sm" />
        Add cycle
      </Button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" className="gap-1.5" disabled={busy}>
          <Icon icon={Add01Icon} size="sm" />
          Add cycle
          <Icon icon={ArrowDown01Icon} size="sm" className="opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-control p-1">
        <DropdownMenuItem onClick={onBlank} className="gap-2.5 rounded-control px-2.5 py-1.5 cursor-pointer">
          <Icon icon={FileAddIcon} size="sm" className="text-tertiary" />
          Blank cycle
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2.5 py-1 text-hint font-normal text-tertiary">From a template</DropdownMenuLabel>
        {templates.map((t) => (
          <DropdownMenuItem key={t.id} onClick={() => onTemplate(t.id)} className="gap-2.5 rounded-control px-2.5 py-1.5 cursor-pointer">
            <Icon icon={Layout01Icon} size="sm" className="text-tertiary" />
            <span className="truncate">{t.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CycleRow({ cycle: c, onOpen }: { cycle: CycleSummary; onOpen: () => void }) {
  const percent = c.assignments === 0 ? 0 : Math.round((c.submitted / c.assignments) * 100);
  const facts = [
    c.kinds.map((k) => REVIEW_KIND_LABELS[k]).join(", ") || "No reviews chosen",
    c.status === "DRAFT" ? null : `${c.participants === 1 ? "1 person" : `${c.participants} people`}`,
    c.nextDueOn ? `Next due ${formatDisplayDate(c.nextDueOn, { style: "medium" })}` : null,
    c.status === "CLOSED" && c.closedAt ? `Closed ${formatDisplayDate(c.closedAt, { style: "medium" })}` : null,
    c.ownerName ? `Run by ${c.ownerName}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <li
      role="link"
      tabIndex={0}
      aria-label={c.name}
      data-test="review-cycle-row"
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
      className="flex cursor-pointer flex-col gap-3 rounded-card border border-divider bg-card px-5 py-4 transition-colors hover:border-divider hover:bg-subtle/40 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-primary">{c.name}</span>
          {c.template ? <StatusBadge status="draft" label="Template" /> : <CycleStatusBadge status={c.status} />}
        </div>
        <div className="mt-0.5 truncate text-hint text-tertiary">{facts}</div>
      </div>
      {c.status !== "DRAFT" && (
        <div className="w-full shrink-0 sm:w-56">
          <div className="flex justify-between text-hint text-tertiary">
            <span>{c.submitted} of {c.assignments} submitted</span>
            {c.overdue > 0 && <span className="text-status-pending-text">{c.overdue} overdue</span>}
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-pill bg-mist" aria-hidden>
            <div className="h-full rounded-pill bg-accent" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
    </li>
  );
}
