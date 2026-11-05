"use client";

import { FC, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarLock01Icon, TaskDone01Icon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { useTimeOffRequestsAwaitingMe } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsAwaitingMe";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { useMyReviews } from "@/components/modules/reviews/hooks";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { useShortDates } from "@/lib/date";
import { showError } from "@/lib/errors/errorToast";
import { showUndoToast } from "@/lib/feedback/undoToast";

/** How many strips show before "Show N more". */
const VISIBLE = 2;
const NOT_NOW_KEY = "hris:waitingOnYou:notNow";

type Common = { id: string; sortKey: string; module: string; icon: IconSvgElement; details: string };
type Strip =
  | (Common & { kind: "decision"; requestId: string; approvedText: string })
  | (Common & { kind: "input"; href: string });

const noSubscribe = () => () => {};
const readNotNow = (): string[] => {
  try {
    return JSON.parse(window.sessionStorage.getItem(NOT_NOW_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
};

/**
 * The decision bar — "Waiting on you" above the profile's tabs (B5; the designers' answer 3.2, `DESIGN_SYSTEM.md` § 7):
 * what the reader has to do about this person — a time off request waiting on their decision, a review they are to
 * write. Seen only by that reader, and only while something is open. Its own component, not a Banner.
 *
 * A head with an accent counter; strips 40 px, radius 10, in the accent's subtle tint, the module's icon, "<module> ·
 * <details>" on one line; "Not now" 88 and the main button 112, 8 apart; two shown, then "Show N more" / "Show less".
 * After a decision the strip goes, the next rises and the counter drops. The request stays Pending — this is not a
 * status.
 *
 * "Not now" hides a strip for the session; the task stays in the inbox. **Approve is held back** (the owner, D1): the
 * strip goes and a toast offers Undo; the approval is sent only when the toast ends — or when the reader leaves the page
 * or the profile — so Undo simply never sends it. A tab closed inside those seconds may lose the approval: the request
 * then stays Pending and comes back here, which is the safe way to fail.
 */
export const WaitingOnYou: FC<{ userId: string; firstName: string }> = ({ userId, firstName }) => {
  const t = useTranslations("organization");
  const shortDates = useShortDates();
  const { data: awaiting } = useTimeOffRequestsAwaitingMe();
  const { data: policies } = useTimeOffPolicies();
  const { data: myReviews } = useMyReviews();
  const approve = useApproveTimeOffRequest();

  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);
  const [hidden, setHidden] = useState<string[]>(() => (typeof window === "undefined" ? [] : readNotNow()));
  /** Approved but not sent yet — the strip is gone while its toast offers Undo. */
  const [held, setHeld] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const strips = useMemo<Strip[]>(() => {
    const policyName = new Map((policies ?? []).map((p) => [p.id, p.name]));
    const decisions: Strip[] = (awaiting ?? [])
      .filter((r) => r.userId === userId && r.status === TimeOffRequestStatus.Pending)
      .map((r) => {
        const range = shortDates.range(r.startDate, r.endDate, { weekday: true });
        return {
          kind: "decision" as const,
          id: `timeoff:${r.id}`,
          // The oldest decision first.
          sortKey: `0:${r.createdAt}`,
          requestId: r.id,
          module: t("profile.waiting.moduleTimeOff"),
          icon: CalendarLock01Icon,
          details: t("profile.waiting.timeOff", {
            name: firstName,
            range,
            policy: policyName.get(r.policyId) ?? "",
            amount: formatDayAmount(r.requestedAmount),
            count: r.requestedAmount,
          }),
          approvedText: t("profile.waiting.approved", { name: firstName, range: shortDates.range(r.startDate, r.endDate) }),
        };
      });
    const inputs: Strip[] = (myReviews?.toWrite ?? [])
      .filter((a) => a.subject.userId === userId && !a.submittedAt)
      .map((a) => ({
        kind: "input" as const,
        id: `review:${a.id}`,
        // Then the nearest deadline.
        sortKey: `1:${a.dueOn ?? "9999-12-31"}`,
        href: `/reviews/write/${a.id}`,
        module: t("profile.waiting.moduleReview"),
        icon: TaskDone01Icon,
        details: a.dueOn
          ? t("profile.waiting.review", { name: firstName, cycle: a.cycleName, due: shortDates.date(a.dueOn, { weekday: true }) })
          : t("profile.waiting.reviewNoDue", { name: firstName, cycle: a.cycleName }),
      }));
    return [...decisions, ...inputs].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [awaiting, policies, myReviews, userId, firstName, shortDates, t]);

  // ── Held approvals: sent when the toast ends, on leaving the profile, or on leaving the page ──
  const pending = useRef(new Map<string, () => void>());
  const send = useCallback(
    (stripId: string, requestId: string) => {
      if (!pending.current.delete(stripId)) return;
      approve.mutateAsync({ requestId }).catch((error: unknown) => {
        // Refused (decided by someone else meanwhile, the policy changed): the strip comes back with the reason.
        setHeld((h) => h.filter((id) => id !== stripId));
        showError(error);
      });
    },
    [approve],
  );
  useEffect(() => {
    const flush = () => pending.current.forEach((commit) => commit());
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  if (!inBrowser) return null;
  const open = strips.filter((s) => !hidden.includes(s.id) && !held.includes(s.id));
  if (open.length === 0) return null;
  const shown = expanded ? open : open.slice(0, VISIBLE);

  const notNow = (id: string) => {
    const next = [...hidden, id];
    setHidden(next);
    try {
      window.sessionStorage.setItem(NOT_NOW_KEY, JSON.stringify(next));
    } catch {
      // A private window without storage: the strip just comes back on the next render of the page.
    }
  };

  const holdApproval = (strip: Extract<Strip, { kind: "decision" }>) => {
    setHeld((h) => [...h, strip.id]);
    pending.current.set(strip.id, () => send(strip.id, strip.requestId));
    showUndoToast({
      message: strip.approvedText,
      onUndo: () => {
        pending.current.delete(strip.id);
        setHeld((h) => h.filter((id) => id !== strip.id));
      },
      onExpire: () => pending.current.get(strip.id)?.(),
    });
  };

  return (
    <section aria-labelledby="waiting-on-you-head" className="mb-5 flex flex-col gap-2">
      <h2 id="waiting-on-you-head" className="flex items-center gap-2 text-label text-tertiary">
        {t("profile.waiting.head")}
        <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-pill bg-accent px-1.5 text-hint font-medium tabular-nums text-on-accent">
          {open.length}
        </span>
      </h2>
      <ul className="flex flex-col gap-1">
        {shown.map((strip) => (
          <li
            key={strip.id}
            className="flex h-10 items-center gap-2 rounded-popover bg-accent-subtle py-1 pr-1 pl-2 text-body"
          >
            <Icon icon={strip.icon} className="shrink-0 text-accent" />
            <p className="min-w-0 flex-1 truncate">
              <span className="text-primary">{strip.module}</span>
              <span className="text-secondary">{" · "}{strip.details}</span>
            </p>
            <Button type="button" variant="secondary" size="sm" className="w-22 shrink-0" onClick={() => notNow(strip.id)}>
              {t("profile.waiting.notNow")}
            </Button>
            {strip.kind === "decision" ? (
              <Button type="button" variant="approve" size="sm" className="w-28 shrink-0" onClick={() => holdApproval(strip)}>
                {t("profile.waiting.approve")}
              </Button>
            ) : (
              <Button asChild size="sm" className="w-28 shrink-0">
                <Link href={strip.href} className="no-underline">{t("profile.waiting.giveInput")}</Link>
              </Button>
            )}
          </li>
        ))}
      </ul>
      {open.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="self-start text-label text-accent-text hover:underline"
        >
          {expanded ? t("profile.waiting.showLess") : t("profile.waiting.showMore", { count: open.length - VISIBLE })}
        </button>
      )}
    </section>
  );
};
