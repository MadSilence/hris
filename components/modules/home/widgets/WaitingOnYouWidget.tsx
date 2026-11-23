"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  ArrowLeft02Icon,
  Calendar03Icon,
  CancelCircleIcon,
  FileTextIcon,
  FlashIcon,
  SignatureIcon,
  StarIcon,
  TaskDone01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useCanAccess } from "@/components/auth/useAccess";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { hubIcon } from "@/components/modules/hub/shared";
import { cn } from "@/lib/cn";
import { useDisplayLocale, useShortDates } from "@/lib/date";
import { showActionError, showError } from "@/lib/errors/errorToast";
import { dayAmountArgs, type TimeOffRequest } from "@/models/timeOff";
import { getTimeOffRequestsAwaitingMeQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useDecideCancellation } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation";
import { DeclineLeaveDialog } from "@/components/modules/timeOff/DeclineLeaveDialog";
import { useLeaveRequestContext } from "@/components/modules/timeOff/lib/requestQuery";
import { useLeaveRequestHref } from "@/components/modules/timeOff/lib/useLeaveRequestHref";
import { NEEDS_ACTION_INBOX_HREF } from "@/components/modules/notifications/utils/inboxFilters";
import { getWaitingOnMeQueryKey } from "@/components/modules/notifications/utils/notificationsQueryKeys";
import { useWaitingOnMe } from "@/components/modules/notifications/hooks/useWaitingOnMe";
import { lifecycleQueryKeys } from "@/components/modules/lifecycle/hooks";
import { decideAutomationApprovalAction } from "@/components/modules/automations/actions/automationActions";
import { automationsHref } from "@/components/modules/automations/list";
import { useRunWords } from "@/components/modules/automations/runs";
import { useAutomationsWeek, useSaveHomeSettings } from "@/components/modules/home/hooks";
import { scheduleWrite, showUndoToast, usePendingWrites } from "@/components/modules/home/deferred";
import { isoDateInZone } from "@/components/modules/home/utils/zonedTime";
import {
  FactChip,
  PersonFace,
  SmallFooter,
  TWO_LINE_ROW,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetLink,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import { TICKABLE_KINDS, taskDoneKey, useTickTask } from "./MyTasksWidget";
import { agreementLineKey, buildDeck, markRead, skipCard, writeKey, type DeckCard } from "./waitingOnYouDeck";
import type { HomeWidgetProps } from "./catalogue";

/** The most dashes under the title; past it, the counter alone. */
const MAX_DASHES = 9;
const LEAVE_MS = { approve: 240, skip: 300 } as const;

const KIND_ICON: Record<DeckCard["kind"], IconSvgElement> = {
  TIME_OFF: Calendar03Icon,
  CANCELLATION: Calendar03Icon,
  AUTOMATION: FlashIcon,
  TASK: TaskDone01Icon,
  REVIEW: StarIcon,
  AGREE: FileTextIcon,
  SIGN: SignatureIcon,
  FAILED_RUN: CancelCircleIcon,
};


/** One request's decision context — who asked, who else is out, what is left after. Shared with the request in full. */
const useDecisionContext = (requestId: string | null) => useLeaveRequestContext(requestId, { staleTime: 30_000 });

/**
 * Every source of the deck, read once for whichever size is drawn. What waits on the reader is the one list
 * (`/me/actions`, A1) the inbox and a profile read too — leave, tasks and review steps, pages to agree to; only HR's
 * failed runs, which are to read and not to do, come from the automations week.
 */
const useDeck = () => {
  const settings = useUserSettings();
  const canSeeAutomations = useCanAccess("SETTINGS.AUTOMATIONS", "VIEW");
  const waiting = useWaitingOnMe();
  const week = useAutomationsWeek(canSeeAutomations);
  const held = usePendingWrites();
  const save = useSaveHomeSettings();
  const [skipped, setSkipped] = useState<string[]>([]);
  const stored = settings.data?.homeSkipped;
  useEffect(() => {
    if (stored) setSkipped(stored);
  }, [stored]);

  const deck = useMemo(
    () =>
      buildDeck({
        requests: waiting.data?.requests ?? [],
        tasks: waiting.data?.tasks ?? [],
        failedRuns: week.data?.failedToday ?? [],
        agreements: waiting.data?.agreements ?? [],
        envelopes: waiting.data?.envelopes ?? [],
        skipped,
        held,
        heldTask: (id) => held.has(taskDoneKey(id)),
      }),
    [waiting.data, week.data, skipped, held],
  );

  const keep = (next: string[]) => {
    setSkipped(next);
    // Kept for this person between visits (Q-5); a save that fails only loses the order.
    save.mutate({ homeSkipped: next }, { onError: () => undefined });
  };
  const skip = (key: string) => keep(skipCard(skipped, key, deck));
  // A failed run's Mark as read (W13): a permanent skip of that run, in the same list.
  const read = (key: string) => keep(markRead(skipped, key));

  return {
    deck,
    skip,
    read,
    loading: waiting.isLoading,
    error: waiting.error,
    refetch: () => {
      void waiting.refetch();
    },
  };
};

/** The decisions Home can take, each held for the undo window (DECISIONS.md § "The home redesign"). */
const useAnswers = () => {
  const t = useTranslations("home");
  const queryClient = useQueryClient();
  const approveLeave = useApproveTimeOffRequest();
  const decideCancellation = useDecideCancellation();
  const tickTask = useTickTask();

  const held = (key: string, message: string, send: () => Promise<void>) => {
    const undo = scheduleWrite(key, async () => {
      try {
        await send();
      } catch (error) {
        showError(error);
      }
      await queryClient.invalidateQueries({ queryKey: getTimeOffRequestsAwaitingMeQueryKey() });
      // The deck reads the one list (A1); an automation's approval goes through a server action, not a mutation, so the
      // app-wide refresh after a mutation does not see it.
      await queryClient.invalidateQueries({ queryKey: getWaitingOnMeQueryKey() });
    });
    showUndoToast(message, t("card.undo"), () => {
      undo();
    });
  };

  return {
    approve: (card: DeckCard) => {
      if (card.kind === "TIME_OFF") {
        held(writeKey.timeOff(card.request.id), t("waitingOnYou.toasts.approved"), async () => {
          await approveLeave.mutateAsync({ requestId: card.request.id });
        });
      } else if (card.kind === "CANCELLATION") {
        held(writeKey.timeOff(card.request.id), t("waitingOnYou.toasts.cancellationApproved"), async () => {
          await decideCancellation.mutateAsync({ requestId: card.request.id, userId: card.request.userId, decision: "CONFIRM" });
        });
      } else if (card.kind === "AUTOMATION") {
        held(writeKey.automation(card.task.id), t("waitingOnYou.toasts.automationApproved"), async () => {
          const result = await decideAutomationApprovalAction({ taskId: card.task.id, approve: true });
          if (result.status === ActionStatus.ERROR) showActionError(result);
          await queryClient.invalidateQueries({ queryKey: lifecycleQueryKeys.myTasksRoot });
        });
      }
    },
    markDone: (card: DeckCard) => {
      if (card.kind === "TASK") tickTask(card.task);
    },
  };
};

/** Where a card opens: its request (in full over Home, AQ-12), its task, its review step, its failed run. */
const hrefOf = (card: DeckCard, leaveHref: (requestId: string) => string) => {
  switch (card.kind) {
    case "TIME_OFF":
    case "CANCELLATION":
      return leaveHref(card.request.id);
    case "REVIEW":
      return card.task.kind === "REVIEW" ? `/reviews/write/by-task/${card.task.id}` : `/reviews/steps/by-task/${card.task.id}`;
    case "FAILED_RUN":
      return automationsHref.seeWhy(card.run.ruleId, card.run.id);
    case "AGREE":
      return `/hub/handbook/${card.agreement.pageId}`;
    case "SIGN":
      return `/documents/sign/${card.envelope.id}`;
    case "TASK":
      // A signature waiting (documents-signing G01): Sign opens the signing screen, not the task list.
      if (card.task.kind === "SIGN" && card.task.envelopeId) return `/documents/sign/${card.task.envelopeId}`;
      // A request for a document (documents-requests R09, R7): the tab of the person it is about, with the request's
      // upload open at once — for whoever is asked to upload, the person or someone else.
      if (card.task.kind === "DOCUMENT" && card.task.processId === null) {
        return `/organization/people/${card.task.subject.id}/documents?request=${card.task.id}`;
      }
      return "/tasks";
    default:
      return "/tasks";
  }
};

/** A leave type's name inside a sentence: "vacation", "parental leave" (widgets A9) — company data, lower-cased only. */
const typeWord = (name: string | null | undefined, locale: string | undefined) => (name ? name.toLocaleLowerCase(locale) : "");

/** Whole days from `from` to `to`, both ISO dates. */
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);

/**
 * A card's header (widgets W6): line 1 the person (a 20 avatar) or the object, 14/18 600; line 2 what it is about,
 * 13/18 tertiary. While a time-off card's context is on its way the name is not known — "Someone" would read as an
 * answer (walk of 2026-11-11) — so it is a skeleton.
 */
const CardHeader: React.FC<{ face?: string | null; name: React.ReactNode; line: React.ReactNode; loading?: boolean }> = ({
  face,
  name,
  line,
  loading,
}) => (
  <span className="flex min-w-0 flex-1 flex-col">
    {loading ? (
      <Skeleton className="my-0.5 h-3.5 w-40" />
    ) : (
      <span className="flex min-w-0 items-center gap-1.5 text-body leading-[18px] font-semibold text-primary">
        {face && <PersonFace name={face} size={20} />}
        <span className="truncate">{name}</span>
      </span>
    )}
    {line && <span className="truncate text-label font-normal text-tertiary">{line}</span>}
  </span>
);

/** One card of the deck, its front face: the kind, who and what, the main line, the facts, and the actions. */
const DecisionCard: React.FC<{
  card: DeckCard;
  leaving: "approve" | "skip" | null;
  preview?: boolean;
  onApprove: () => void;
  onSkip: () => void;
  onDone: () => void;
  onRead: () => void;
}> = ({ card, leaving, preview, onApprove, onSkip, onDone, onRead }) => {
  const t = useTranslations("home");
  const tTimeOff = useTranslations("timeOff");
  const router = useRouter();
  const locale = useDisplayLocale();
  const dates = useShortDates();
  const words = useRunWords();
  const settings = useUserSettings();
  const { userId } = useCurrentUser();
  const today = isoDateInZone(new Date(), settings.data?.companyTimeZone);
  const context = useDecisionContext(card.kind === "TIME_OFF" || card.kind === "CANCELLATION" ? card.request.id : null);
  const leaveHref = useLeaveRequestHref();
  const [declining, setDeclining] = useState(false);
  const tab = preview ? -1 : undefined;

  let header: React.ReactNode = null;
  let when = "";
  let main = "";
  let under: React.ReactNode = null;
  let actions: React.ReactNode = null;
  let tile: IconSvgElement = KIND_ICON[card.kind];

  if (card.kind === "TIME_OFF" || card.kind === "CANCELLATION") {
    const days = tTimeOff("amount.days", dayAmountArgs(card.request.requestedAmount));
    const type = typeWord(context.data?.leaveTypeName, locale);
    const name = context.data?.requesterName ?? t("card.unnamed");
    header = (
      <CardHeader
        loading={!context.data}
        face={name}
        name={name}
        line={t(card.kind === "CANCELLATION" ? "waitingOnYou.wantsToCancel" : "waitingOnYou.wantsTimeOff", {
          days,
          hasType: type ? "yes" : "no",
          type,
        })}
      />
    );
    when = dates.ago(card.request.createdAt);
    // "Thu 19 → Sat 21 Nov" (W7): the span's own form, with an arrow.
    main = dates.range(card.request.startDate, card.request.endDate, { weekday: true, hideYear: true }).replace(" – ", " → ");
    const peer = context.data?.peersAway?.[0];
    if (peer) {
      const peerName = [peer.firstName, peer.lastName].filter(Boolean).join(" ");
      const date = dates.date(peer.startDate > card.request.startDate ? peer.startDate : card.request.startDate, { hideYear: true });
      under = (
        <p className="mt-0.5 flex min-w-0 items-center gap-2 text-label font-normal text-status-pending-text">
          <PersonFace name={peerName} avatarUrl={peer.avatarUrl} size={20} />
          <span className="truncate">
            {peer.teamName
              ? t("waitingOnYou.alsoOutTeam", { name: peer.firstName, team: peer.teamName, date })
              : t("waitingOnYou.alsoOut", { name: peer.firstName, date })}
          </span>
        </p>
      );
    } else {
      const balance = context.data?.balance;
      under = (
        <span className="mt-2 flex flex-wrap gap-1.5">
          <FactChip>
            {context.data?.workingDays
              ? t("waitingOnYou.workingDays", dayAmountArgs(card.request.requestedAmount))
              : days}
          </FactChip>
          {/* U7: a waiting request is not counted yet — what is left after it is the balance minus what waits. */}
          {balance && card.kind === "TIME_OFF" && (
            <FactChip>{t("waitingOnYou.leftAfter", { left: tTimeOff("amount.days", dayAmountArgs(balance.availableBalance ?? balance.currentBalance)) })}</FactChip>
          )}
        </span>
      );
    }
    actions = (
      <>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          tabIndex={tab}
          onClick={() => (card.kind === "TIME_OFF" ? setDeclining(true) : router.push(leaveHref(card.request.id)))}
        >
          {t("waitingOnYou.decline")}
        </Button>
        <Button type="button" variant="approve" size="sm" tabIndex={tab} loading={leaving === "approve"} onClick={onApprove}>
          {leaving === "approve" ? t("waitingOnYou.approving") : t("waitingOnYou.approve")}
        </Button>
      </>
    );
  } else if (card.kind === "AUTOMATION") {
    header = <CardHeader name={t("waitingOnYou.automation")} line={t("waitingOnYou.automationWaits")} />;
    main = card.task.title;
    under = card.task.subject?.name ? <p className="mt-0.5 truncate text-label font-normal text-tertiary">{card.task.subject.name}</p> : null;
    actions = (
      <>
        <Button type="button" variant="secondary" size="sm" tabIndex={tab} onClick={() => router.push("/tasks")}>
          {t("waitingOnYou.decline")}
        </Button>
        <Button type="button" variant="approve" size="sm" tabIndex={tab} loading={leaving === "approve"} onClick={onApprove}>
          {leaving === "approve" ? t("waitingOnYou.approving") : t("waitingOnYou.approve")}
        </Button>
      </>
    );
  } else if (card.kind === "TASK" || card.kind === "REVIEW") {
    const task = card.task;
    const process = task.processType ? t(`processes.types.${task.processType}`) : "";
    const self = Boolean(userId) && task.subject?.id === userId;
    // Never the reader's own name (W11).
    const person = self ? "" : task.subject?.name ?? "";
    // W11 (DQ-19): a review card is titled "Review", its cycle on the line under it (the review task carries the cycle's
    // name as its description); no question count, and no "Write your self review", which the card already says.
    const cycle = card.kind === "REVIEW" ? task.description?.trim() ?? "" : "";
    const from = card.kind === "REVIEW" ? cycle : process;
    const line =
      from || person
        ? t("waitingOnYou.taskFrom", { hasProcess: from ? "yes" : "no", process: from, hasPerson: person ? "yes" : "no", person })
        : "";
    header = <CardHeader name={card.kind === "REVIEW" ? t("waitingOnYou.kinds.review") : task.title} line={line} />;
    const left = task.dueDate ? daysBetween(today, task.dueDate) : null;
    // A signature a task stands for reads as one sent from a profile (G01): the signature tile, "Sign by Wed, 17 Dec".
    const signTask = card.kind === "TASK" && task.kind === "SIGN";
    if (signTask) {
      tile = SignatureIcon;
      const sender = task.requestedBy?.name ?? "";
      header = <CardHeader name={task.title} line={t("waitingOnYou.toSignFrom", { hasSender: sender ? "yes" : "no", sender })} />;
    }
    if (signTask && task.dueDate && !(task.dueReached && task.dueDate < today)) {
      main = t("waitingOnYou.signBy", { date: dates.date(task.dueDate, { weekday: true, hideYear: true }) });
    } else if (task.dueReached && task.dueDate && task.dueDate < today) {
      main = t("waitingOnYou.taskOverdue", { date: dates.date(task.dueDate, { weekday: true, hideYear: true }) });
    } else if (card.kind === "REVIEW") {
      main = t("waitingOnYou.reviewDue", { hasDate: left === null ? "no" : "yes", count: Math.max(0, left ?? 0) });
    } else {
      main = t("waitingOnYou.taskDue", {
        hasDate: task.dueDate ? "yes" : "no",
        isToday: left === 0 ? "yes" : "no",
        date: task.dueDate ? dates.date(task.dueDate, { weekday: true, hideYear: true }) : "",
      });
    }
    if (card.kind === "REVIEW") {
      under = self ? (
        <span className="mt-2 flex flex-wrap gap-1.5">
          <FactChip>{t("waitingOnYou.managerSeesAfter")}</FactChip>
        </span>
      ) : null;
    } else if (task.requestedBy?.name && !signTask) {
      under = <p className="mt-0.5 truncate text-label font-normal text-tertiary">{t("waitingOnYou.assignedBy", { name: task.requestedBy.name })}</p>;
    }
    actions =
      card.kind === "TASK" && TICKABLE_KINDS.has(task.kind) ? (
        <Button type="button" size="sm" tabIndex={tab} onClick={onDone}>
          <Icon icon={Tick02Icon} size="sm" />
          {t("waitingOnYou.markDone")}
        </Button>
      ) : (
        <Button asChild size="sm" tabIndex={tab}>
          {card.kind === "TASK" && task.kind === "SIGN" ? (
            <Link href={hrefOf(card, leaveHref)}>
              <Icon icon={SignatureIcon} size="sm" />
              {t("waitingOnYou.sign")}
            </Link>
          ) : (
            <Link href={hrefOf(card, leaveHref)}>{t("waitingOnYou.start")}</Link>
          )}
        </Button>
      );
  } else if (card.kind === "AGREE") {
    // No agreeing from Home (W15): the button only opens the page, where the person agrees after reading it.
    const agreement = card.agreement;
    tile = hubIcon(agreement.icon);
    // W15 (DQ-22): a page never agreed to has no second line — its name and the card's own action; "was updated" stays
    // for a new version of a page agreed to before.
    const lineKey = agreementLineKey(agreement);
    header = <CardHeader name={agreement.title} line={lineKey ? t(`waitingOnYou.${lineKey}`) : null} />;
    main = agreement.overdue
      ? t("waitingOnYou.agreeOverdue", { date: dates.date(agreement.dueOn, { weekday: true, hideYear: true }) })
      : agreement.dueOn
        ? t("waitingOnYou.agreeBy", { date: dates.date(agreement.dueOn, { weekday: true, hideYear: true }) })
        : t("waitingOnYou.readAndAgree");
    // The page's What changed points, joined with commas; left out when it has none (W15).
    const points = agreement.whatChanged ?? [];
    under = points.length ? (
      <p className="mt-0.5 truncate text-label font-normal text-tertiary">{t("waitingOnYou.whatChanged", { points: points.join(", ") })}</p>
    ) : null;
    actions = (
      <Button asChild size="sm" tabIndex={tab}>
        <Link href={hrefOf(card, leaveHref)}>{t("waitingOnYou.readAndAgree")}</Link>
      </Button>
    );
  } else if (card.kind === "SIGN") {
    // Signing is never done on Home: the document has to be read first, on its own screen.
    const envelope = card.envelope;
    const lastDay = envelope.expiresAt ? envelope.expiresAt.slice(0, 10) : null;
    // Its sender by name; the product never says "HR" (W6).
    header = (
      <CardHeader
        name={envelope.title}
        line={t("waitingOnYou.toSignFrom", { hasSender: envelope.sentByName ? "yes" : "no", sender: envelope.sentByName ?? "" })}
      />
    );
    when = dates.ago(envelope.sentAt);
    main = lastDay ? t("waitingOnYou.signBy", { date: dates.date(lastDay, { weekday: true, hideYear: true }) }) : envelope.title;
    actions = (
      <Button asChild size="sm" tabIndex={tab}>
        <Link href={hrefOf(card, leaveHref)}>
          <Icon icon={SignatureIcon} size="sm" />
          {t("waitingOnYou.sign")}
        </Link>
      </Button>
    );
  } else {
    header = <CardHeader name={t("waitingOnYou.automation")} line={t("waitingOnYou.didntRun")} />;
    when = t("card.today");
    main = card.run.ruleName ?? "";
    under = (
      <span className="mt-0.5 line-clamp-2 block text-label font-normal text-status-declined-text">
        {t("waitingOnYou.runLine", {
          hasPerson: card.run.person?.name ? "yes" : "no",
          person: card.run.person?.name ?? "",
          reason: words.reason(card.run.reason) ?? "",
        })}
      </span>
    );
    // Mark as read (the owner, 2026-11-19, W13): the run leaves this person's deck for good.
    actions = (
      <>
        <Button type="button" variant="secondary" size="sm" tabIndex={tab} onClick={onRead}>
          {t("waitingOnYou.markAsRead")}
        </Button>
        <Button asChild size="sm" tabIndex={tab}>
          <Link href={hrefOf(card, leaveHref)}>{t("waitingOnYou.fixIt")}</Link>
        </Button>
      </>
    );
  }

  const href = hrefOf(card, leaveHref);
  return (
    <article
      data-deck-leaving={leaving ?? undefined}
      className="relative flex h-full flex-col gap-1 rounded-panel bg-card px-5 py-[18px] shadow-deck [transform:rotate(-0.5deg)]"
    >
      <Link href={href} tabIndex={tab} className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-control",
            card.kind === "FAILED_RUN" ? "bg-status-declined-bg text-status-declined-text" : "bg-accent-subtle text-accent-text",
          )}
        >
          <Icon icon={tile} size="md" />
        </span>
        {header}
        {when && <span className="shrink-0 text-hint leading-5 text-tertiary">{when}</span>}
      </Link>
      <Link href={href} tabIndex={tab} className="mt-3.5 truncate text-deck-line tracking-[-0.02em] text-primary">
        {main}
      </Link>
      {context.isLoading && (card.kind === "TIME_OFF" || card.kind === "CANCELLATION") ? <Skeleton className="mt-2 h-5 w-3/5" /> : under}
      <div className="mt-auto flex items-center justify-between gap-2">
        <button
          type="button"
          tabIndex={tab}
          onClick={onSkip}
          className="inline-flex items-center gap-1 text-label leading-5 text-secondary transition-colors duration-100 hover:text-primary"
        >
          {/* W9: the arrow at 14. */}
          <Icon icon={ArrowLeft02Icon} size="sm" className="size-3.5" />
          {t("waitingOnYou.skip")}
        </button>
        <span className="flex gap-2">{actions}</span>
      </div>
      {card.kind === "TIME_OFF" ? (
        <DeclineLeaveDialog
          target={declining
            ? {
                requestId: card.request.id,
                startDate: card.request.startDate,
                endDate: card.request.endDate,
                policyName: context.data?.leaveTypeName ?? null,
                firstName: context.data?.requesterName?.split(" ")[0] ?? null,
              }
            : null}
          onClose={() => setDeclining(false)}
        />
      ) : null}
    </article>
  );
};

/** The deck (Large): one card at a time, up to two behind it, the counter and a dash per card. */
const DecisionDeck: React.FC<{
  deck: DeckCard[];
  preview?: boolean;
  onSkip: (key: string) => void;
  onRead: (key: string) => void;
}> = ({ deck, preview, onSkip, onRead }) => {
  const t = useTranslations("home");
  const answers = useAnswers();
  const [leaving, setLeaving] = useState<{ key: string; how: "approve" | "skip" } | null>(null);
  const front = deck[0];
  const behind = Math.min(2, deck.length - 1);

  const leave = (how: "approve" | "skip", then: () => void) => {
    if (!front || leaving) return;
    setLeaving({ key: front.key, how });
    setTimeout(() => {
      then();
      setLeaving(null);
    }, LEAVE_MS[how]);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* W5: "1 of 3" 13/20 600, 10 to the bar; dashes 4 high, 4 apart, on the hairline grey. */}
      <div className="flex items-center gap-2.5">
        <span className="shrink-0 text-label leading-5 font-semibold text-accent-text">{t("waitingOnYou.counter", { at: 1, count: deck.length })}</span>
        {deck.length <= MAX_DASHES && (
          <span className="flex flex-1 gap-1" aria-hidden>
            {deck.map((card, i) => (
              <span key={card.key} className={cn("h-1 flex-1 rounded-pill", i === 0 ? "bg-accent" : "bg-divider")} />
            ))}
          </span>
        )}
      </div>
      <div className="relative min-h-0 flex-1 pr-5 pb-3">
        {behind >= 2 && (
          <span aria-hidden className="absolute inset-0 translate-x-[18px] translate-y-[10px] rotate-[3.5deg] rounded-panel bg-accent-subtle" />
        )}
        {behind >= 1 && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 translate-x-[9px] translate-y-[5px] rotate-[1.75deg] rounded-panel border",
              behind >= 2 ? "border-divider bg-card" : "border-accent-muted bg-accent-subtle",
            )}
          />
        )}
        {front && (
          <DecisionCard
            key={front.key}
            card={front}
            preview={preview}
            leaving={leaving?.key === front.key ? leaving.how : null}
            onApprove={() => leave("approve", () => answers.approve(front))}
            onDone={() => leave("approve", () => answers.markDone(front))}
            onSkip={() => leave("skip", () => onSkip(front.key))}
            onRead={() => leave("approve", () => onRead(front.key))}
          />
        )}
      </div>
    </div>
  );
};

/**
 * What waits for the reader's answer (`home-widgets` § 1): leave to approve, an automation's approval, tasks and review
 * steps, and — for HR — a failed automation run. Always shown, with "All caught up" when nothing waits. The Large one
 * is a deck: Approve answers on Home (held five seconds with Undo), Decline opens the request with its reason field,
 * Skip puts the card at the back for this person.
 */
export const WaitingOnYouWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const { deck, skip, read, loading, error, refetch } = useDeck();
  const title = t("widgets.waitingOnYou.title");
  const inbox = size === "S" ? undefined : <WidgetLink href={NEEDS_ACTION_INBOX_HREF}>{t("waitingOnYou.inbox")}</WidgetLink>;

  if (loading) {
    return (
      <WidgetCard title={title} size={size} aside={inbox}>
        <WidgetSkeleton number={size === "S"} rows={size === "S" ? 0 : 2} />
      </WidgetCard>
    );
  }
  if (error) {
    return (
      <WidgetCard title={title} size={size} aside={inbox}>
        <WidgetError size={size} message={t("card.couldNotLoad", { thing: "requests" })} onRetry={refetch} />
      </WidgetCard>
    );
  }
  if (deck.length === 0) {
    return (
      <WidgetCard title={title} size={size} aside={inbox}>
        <WidgetEmpty size={size} scene="all-caught-up" title={t("waitingOnYou.emptyTitle")} line={t("waitingOnYou.emptyLine")} />
      </WidgetCard>
    );
  }

  // A3: Small has no link; A2: the number on the left and the faces on the right of one bottom row.
  if (size === "S") {
    return (
      <WidgetCard title={title} size={size}>
        <SmallFooter value={deck.length} word={t("waitingOnYou.requests", { count: deck.length })} aside={<DeckFaces deck={deck} />} />
      </WidgetCard>
    );
  }

  if (size === "M") {
    return (
      <WidgetCard title={title} size={size} aside={inbox}>
        {/* W2: the count 13/20 600 in the accent, 8, the words 13/20 400 tertiary. */}
        <p className="flex items-baseline gap-2 text-label leading-5 font-normal text-tertiary">
          {t.rich("waitingOnYou.needAnswer", {
            count: deck.length,
            b: (chunks) => <span className="font-semibold text-accent-text">{chunks}</span>,
          })}
        </p>
        <ul className="flex min-w-0 flex-col divide-y divide-divider">
          {deck.slice(0, 3).map((card) => (
            <DeckRow key={card.key} card={card} preview={preview} />
          ))}
        </ul>
        <Button asChild variant="approve" className="mt-auto w-full" tabIndex={preview ? -1 : undefined}>
          <Link href={NEEDS_ACTION_INBOX_HREF}>{t("waitingOnYou.review", { count: deck.length })}</Link>
        </Button>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title={title} size={size} aside={inbox}>
      <DecisionDeck deck={deck} preview={preview} onSkip={skip} onRead={read} />
    </WidgetCard>
  );
};

/** The Small one's faces: who is waiting, up to three. */
const DeckFaces: React.FC<{ deck: DeckCard[] }> = ({ deck }) => {
  const t = useTranslations("home");
  const leave = deck.filter((card): card is Extract<DeckCard, { request: TimeOffRequest }> => card.kind === "TIME_OFF" || card.kind === "CANCELLATION");
  return (
    <span className="flex -space-x-2">
      {leave.slice(0, 3).map((card) => (
        <FaceOf key={card.key} requestId={card.request.id} fallback={t("card.unnamed")} />
      ))}
    </span>
  );
};

const FaceOf: React.FC<{ requestId: string; fallback: string }> = ({ requestId, fallback }) => {
  const context = useDecisionContext(requestId);
  if (!context.data && context.isLoading) return <Skeleton className="size-7 shrink-0 rounded-pill ring-2 ring-card" />;
  return <PersonFace name={context.data?.requesterName ?? fallback} size={28} />;
};

/** A row of the Medium one: face, name, and what they want with its dates. */
const DeckRow: React.FC<{ card: DeckCard; preview?: boolean }> = ({ card, preview }) => {
  const t = useTranslations("home");
  const tTimeOff = useTranslations("timeOff");
  const dates = useShortDates();
  const locale = useDisplayLocale();
  const leave = card.kind === "TIME_OFF" || card.kind === "CANCELLATION";
  const context = useDecisionContext(leave ? card.request.id : null);
  const leaveHref = useLeaveRequestHref();
  const name = leave
    ? context.data?.requesterName ?? t("card.unnamed")
    : card.kind === "FAILED_RUN"
      ? card.run.ruleName ?? ""
      : card.kind === "AGREE"
        ? card.agreement.title
        : card.kind === "SIGN"
          ? card.envelope.title
          : card.task.title;
  // W3: "3 days vacation · 12–14 Nov" — the days, the leave type, then the dates ("today" for a day that is today).
  const type = leave ? typeWord(context.data?.leaveTypeName, locale) : "";
  const line = leave
    ? t("waitingOnYou.rowLine", {
        cancel: card.kind === "CANCELLATION" ? "yes" : "no",
        days: tTimeOff("amount.days", dayAmountArgs(card.request.requestedAmount)),
        hasType: type ? "yes" : "no",
        type,
        dates:
          card.request.startDate === card.request.endDate
            ? dates.day(card.request.startDate, { lowercase: true, hideYear: true })
            : dates.range(card.request.startDate, card.request.endDate, { hideYear: true }),
      })
    : card.kind === "AGREE"
      ? t("waitingOnYou.kinds.agree")
      : card.kind === "SIGN"
        ? t("waitingOnYou.kinds.sign")
        : t(`waitingOnYou.kinds.${card.kind === "FAILED_RUN" ? "failedRun" : card.kind === "AUTOMATION" ? "automation" : card.kind === "REVIEW" ? "review" : "task"}`);
  return (
    <li>
      <Link
        href={hrefOf(card, leaveHref)}
        tabIndex={preview ? -1 : undefined}
        className={TWO_LINE_ROW.row}
      >
        {/* While a leave's context is on its way its asker is not known: a skeleton, never "Someone" (as the card, W6). */}
        {leave && !context.data ? (
          <>
            <Skeleton className="size-7 shrink-0 rounded-pill" />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5" aria-busy="true">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-40" />
            </span>
          </>
        ) : (
          <>
            <PersonFace name={name} size={28} />
            <span className="min-w-0 flex-1">
              <span className={TWO_LINE_ROW.name}>{name}</span>
              <span className={TWO_LINE_ROW.line}>{line}</span>
            </span>
          </>
        )}
      </Link>
    </li>
  );
};
