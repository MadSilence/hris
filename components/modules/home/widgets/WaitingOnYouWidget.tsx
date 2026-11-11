"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  ArrowLeft01Icon,
  Calendar03Icon,
  CancelCircleIcon,
  FlashIcon,
  StarIcon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useCanAccess } from "@/components/auth/useAccess";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { cn } from "@/lib/cn";
import { useDisplayLocale, useShortDates } from "@/lib/date";
import { showActionError, showError } from "@/lib/errors/errorToast";
import { dayAmountArgs, type TimeOffDecisionContext, type TimeOffRequest } from "@/models/timeOff";
import { getTimeOffRequestsAwaitingMeQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useDecideCancellation } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation";
import { timeOffDecisionQueryKey } from "@/components/modules/timeOffDecision";
import { NEEDS_ACTION_INBOX_HREF } from "@/components/modules/notifications/utils/inboxFilters";
import { lifecycleQueryKeys, useMyTasks } from "@/components/modules/lifecycle/hooks";
import { decideAutomationApprovalAction } from "@/components/modules/automations/actions/automationActions";
import { automationsHref } from "@/components/modules/automations/list";
import { useRunWords } from "@/components/modules/automations/runs";
import { ago } from "@/components/modules/home/utils/ago";
import { useAutomationsWeek, useSaveHomeSettings } from "@/components/modules/home/hooks";
import { scheduleWrite, showUndoToast, usePendingWrites } from "@/components/modules/home/deferred";
import { isoDateInZone } from "@/components/modules/home/utils/zonedTime";
import {
  BigNumber,
  FactChip,
  PersonFace,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetLink,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import { TICKABLE_KINDS, taskDoneKey, useTickTask } from "./MyTasksWidget";
import { buildDeck, skipCard, writeKey, type DeckCard } from "./waitingOnYouDeck";
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
  FAILED_RUN: CancelCircleIcon,
};


/** The leave this reader may decide; read only with the right to see leave at all. */
const useAwaitingMe = (enabled: boolean) =>
  useQuery<TimeOffRequest[]>({
    queryKey: getTimeOffRequestsAwaitingMeQueryKey(),
    queryFn: () => timeOffRequestsService.listAwaitingMe(),
    staleTime: 30_000,
    enabled,
  });

/** One request's decision context — who asked, who else is out, what is left after. Shared with the request page. */
const useDecisionContext = (requestId: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<TimeOffDecisionContext>({
    queryKey: timeOffDecisionQueryKey(requestId ?? ""),
    queryFn: () => internalApiClient.get<TimeOffDecisionContext>(`/time-off/requests/${requestId}/decision-context`),
    enabled: Boolean(requestId),
    staleTime: 30_000,
  });
};

/** Every source of the deck, read once for whichever size is drawn. */
const useDeck = () => {
  const settings = useUserSettings();
  const canSeeLeave = useCanAccess("PEOPLE.TIME_OFF", "VIEW");
  const canSeeAutomations = useCanAccess("SETTINGS.AUTOMATIONS", "VIEW");
  const requests = useAwaitingMe(canSeeLeave);
  const tasks = useMyTasks(false);
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
        requests: requests.data ?? [],
        tasks: tasks.data ?? [],
        failedRuns: week.data?.failedToday ?? [],
        skipped,
        held,
        heldTask: (id) => held.has(taskDoneKey(id)),
      }),
    [requests.data, tasks.data, week.data, skipped, held],
  );

  const skip = (key: string) => {
    const next = skipCard(skipped, key, deck);
    setSkipped(next);
    // Kept for this person between visits (Q-5); a save that fails only loses the order.
    save.mutate({ homeSkipped: next }, { onError: () => undefined });
  };

  return {
    deck,
    skip,
    loading: (canSeeLeave && requests.isLoading) || tasks.isLoading,
    error: (canSeeLeave ? requests.error : null) ?? tasks.error,
    refetch: () => {
      void requests.refetch();
      void tasks.refetch();
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

/** Where a card opens: its request, its task, its review step, its failed run. */
const hrefOf = (card: DeckCard) => {
  switch (card.kind) {
    case "TIME_OFF":
    case "CANCELLATION":
      return `/time-off/requests/${card.request.id}`;
    case "REVIEW":
      return card.task.kind === "REVIEW" ? `/reviews/write/by-task/${card.task.id}` : `/reviews/steps/by-task/${card.task.id}`;
    case "FAILED_RUN":
      return automationsHref.seeWhy(card.run.ruleId, card.run.id);
    default:
      return "/tasks";
  }
};

/** The person a time-off card is about, from the request's decision context. */
const RequesterLine: React.FC<{ card: Extract<DeckCard, { request: TimeOffRequest }>; context: TimeOffDecisionContext | undefined }> = ({ card, context }) => {
  const t = useTranslations("home");
  const tTimeOff = useTranslations("timeOff");
  const days = tTimeOff("amount.days", dayAmountArgs(card.request.requestedAmount));
  // Until the context arrives the name is not known; "Someone" would read as an answer (walk of 2026-11-11).
  if (!context) return <Skeleton className="h-4 w-40" />;
  const name = context.requesterName ?? t("card.unnamed");
  return (
    <span className="flex min-w-0 items-center gap-2">
      <PersonFace name={name} size={20} />
      <span className="min-w-0 truncate text-label">
        <span className="font-semibold text-primary">{name}</span>{" "}
        <span className="font-normal text-secondary">
          {card.kind === "CANCELLATION" ? t("waitingOnYou.wantsToCancel", { days }) : t("waitingOnYou.wantsTimeOff", { days })}
        </span>
      </span>
    </span>
  );
};

/** One card of the deck, its front face: the kind, who and what, the main line, the facts, and the actions. */
const DecisionCard: React.FC<{
  card: DeckCard;
  leaving: "approve" | "skip" | null;
  preview?: boolean;
  onApprove: () => void;
  onSkip: () => void;
  onDone: () => void;
}> = ({ card, leaving, preview, onApprove, onSkip, onDone }) => {
  const t = useTranslations("home");
  const tTimeOff = useTranslations("timeOff");
  const router = useRouter();
  const locale = useDisplayLocale();
  const dates = useShortDates();
  const words = useRunWords();
  const settings = useUserSettings();
  const today = isoDateInZone(new Date(), settings.data?.companyTimeZone);
  const context = useDecisionContext(card.kind === "TIME_OFF" || card.kind === "CANCELLATION" ? card.request.id : null);
  const tab = preview ? -1 : undefined;

  let who: React.ReactNode = null;
  let when = "";
  let main = "";
  let under: React.ReactNode = null;
  let actions: React.ReactNode = null;

  if (card.kind === "TIME_OFF" || card.kind === "CANCELLATION") {
    who = <RequesterLine card={card} context={context.data} />;
    when = ago(card.request.createdAt, locale);
    main = dates.range(card.request.startDate, card.request.endDate, { weekday: true });
    const peer = context.data?.peersAway?.[0];
    if (peer) {
      const peerName = [peer.firstName, peer.lastName].filter(Boolean).join(" ");
      const date = dates.date(peer.startDate > card.request.startDate ? peer.startDate : card.request.startDate);
      under = (
        <p className="flex min-w-0 items-center gap-2 text-label text-status-pending-text">
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
        <span className="flex flex-wrap gap-1.5">
          <FactChip>{tTimeOff("amount.days", dayAmountArgs(card.request.requestedAmount))}</FactChip>
          {balance && card.kind === "TIME_OFF" && (
            <FactChip>{t("waitingOnYou.leftAfter", { left: tTimeOff("amount.days", dayAmountArgs(balance.currentBalance)) })}</FactChip>
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
          onClick={() => router.push(`/time-off/requests/${card.request.id}?decline=1`)}
        >
          {t("waitingOnYou.decline")}
        </Button>
        <Button type="button" variant="approve" size="sm" tabIndex={tab} loading={leaving === "approve"} onClick={onApprove}>
          {leaving === "approve" ? t("waitingOnYou.approving") : t("waitingOnYou.approve")}
        </Button>
      </>
    );
  } else if (card.kind === "AUTOMATION") {
    who = <span className="truncate text-label font-semibold text-primary">{t("waitingOnYou.automationWaits")}</span>;
    main = card.task.title;
    under = card.task.subject?.name ? <p className="truncate text-label text-secondary">{card.task.subject.name}</p> : null;
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
    const person = task.subject?.name ?? "";
    const from = process || person
      ? t("waitingOnYou.taskFrom", { hasProcess: process ? "yes" : "no", process, hasPerson: person ? "yes" : "no", person })
      : "";
    who = <span className="truncate text-label"><span className="font-semibold text-primary">{task.title}</span></span>;
    main =
      task.dueReached && task.dueDate
        ? t("waitingOnYou.taskOverdue", { date: dates.date(task.dueDate) })
        : t("waitingOnYou.taskDue", {
            hasDate: task.dueDate ? "yes" : "no",
            date: task.dueDate ? (task.dueDate === today ? t("card.today") : dates.date(task.dueDate, { weekday: true })) : "",
          });
    under = from ? <p className="truncate text-label text-secondary">{from}</p> : null;
    actions =
      card.kind === "TASK" && TICKABLE_KINDS.has(task.kind) ? (
        <Button type="button" size="sm" tabIndex={tab} onClick={onDone}>
          {t("waitingOnYou.markDone")}
        </Button>
      ) : (
        <Button asChild size="sm" tabIndex={tab}>
          <Link href={hrefOf(card)}>{t("waitingOnYou.start")}</Link>
        </Button>
      );
  } else {
    who = <span className="truncate text-label font-semibold text-primary">{t("waitingOnYou.runFailed")}</span>;
    main = card.run.ruleName ?? "";
    under = (
      <span className="line-clamp-2 block text-label text-status-declined-text">
        {t("waitingOnYou.runLine", {
          hasPerson: card.run.person?.name ? "yes" : "no",
          person: card.run.person?.name ?? "",
          reason: words.reason(card.run.reason) ?? "",
        })}
      </span>
    );
    actions = (
      <Button asChild size="sm" tabIndex={tab}>
        <Link href={hrefOf(card)}>{t("waitingOnYou.fixIt")}</Link>
      </Button>
    );
  }

  return (
    <article
      data-deck-leaving={leaving ?? undefined}
      className="relative flex h-full flex-col gap-3 rounded-panel bg-card px-5 py-[18px] shadow-deck [transform:rotate(-0.5deg)]"
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-control",
            card.kind === "FAILED_RUN" ? "bg-status-declined-bg text-status-declined-text" : "bg-accent-subtle text-accent-text",
          )}
        >
          <Icon icon={KIND_ICON[card.kind]} size="md" />
        </span>
        <Link href={hrefOf(card)} tabIndex={tab} className="flex min-w-0 flex-1 items-center justify-between gap-2">
          {who}
          {when && <span className="shrink-0 text-hint text-tertiary">{when}</span>}
        </Link>
      </div>
      <Link href={hrefOf(card)} tabIndex={tab} className="text-deck-line text-primary">
        {main}
      </Link>
      {context.isLoading && (card.kind === "TIME_OFF" || card.kind === "CANCELLATION") ? <Skeleton className="h-5 w-3/5" /> : under}
      <div className="mt-auto flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" tabIndex={tab} onClick={onSkip} className="-ml-2 text-secondary">
          <Icon icon={ArrowLeft01Icon} size="sm" />
          {t("waitingOnYou.skip")}
        </Button>
        <span className="flex gap-2">{actions}</span>
      </div>
    </article>
  );
};

/** The deck (Large): one card at a time, up to two behind it, the counter and a dash per card. */
const DecisionDeck: React.FC<{ deck: DeckCard[]; preview?: boolean; onSkip: (key: string) => void }> = ({ deck, preview, onSkip }) => {
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
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-label text-accent-text">{t("waitingOnYou.counter", { at: 1, count: deck.length })}</span>
        {deck.length <= MAX_DASHES && (
          <span className="flex flex-1 gap-1.5" aria-hidden>
            {deck.map((card, i) => (
              <span key={card.key} className={cn("h-1 flex-1 rounded-pill", i === 0 ? "bg-accent" : "bg-mist")} />
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
  const { deck, skip, loading, error, refetch } = useDeck();
  const title = t("widgets.waitingOnYou.title");
  const inbox = <WidgetLink href={NEEDS_ACTION_INBOX_HREF}>{t("waitingOnYou.inbox")}</WidgetLink>;

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

  if (size === "S") {
    return (
      <WidgetCard title={title} size={size} aside={inbox}>
        <BigNumber size="s" value={deck.length} word={t("waitingOnYou.requests", { count: deck.length })} />
        <DeckFaces deck={deck} />
      </WidgetCard>
    );
  }

  if (size === "M") {
    return (
      <WidgetCard title={title} size={size} aside={inbox}>
        <p className="text-body text-secondary">
          {t.rich("waitingOnYou.needAnswer", {
            count: deck.length,
            b: (chunks) => <span className="font-semibold text-accent-text">{chunks}</span>,
          })}
        </p>
        <ul className="flex flex-col divide-y divide-divider">
          {deck.slice(0, 3).map((card) => (
            <DeckRow key={card.key} card={card} preview={preview} />
          ))}
        </ul>
        <Button asChild className="mt-auto w-full" tabIndex={preview ? -1 : undefined}>
          <Link href={NEEDS_ACTION_INBOX_HREF}>{t("waitingOnYou.review", { count: deck.length })}</Link>
        </Button>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title={title} size={size} aside={inbox}>
      <DecisionDeck deck={deck} preview={preview} onSkip={skip} />
    </WidgetCard>
  );
};

/** The Small one's faces: who is waiting, up to three. */
const DeckFaces: React.FC<{ deck: DeckCard[] }> = ({ deck }) => {
  const t = useTranslations("home");
  const leave = deck.filter((card): card is Extract<DeckCard, { request: TimeOffRequest }> => card.kind === "TIME_OFF" || card.kind === "CANCELLATION");
  return (
    <span className="flex -space-x-1.5">
      {leave.slice(0, 3).map((card) => (
        <FaceOf key={card.key} requestId={card.request.id} fallback={t("card.unnamed")} />
      ))}
    </span>
  );
};

const FaceOf: React.FC<{ requestId: string; fallback: string }> = ({ requestId, fallback }) => {
  const context = useDecisionContext(requestId);
  return <PersonFace name={context.data?.requesterName ?? fallback} size={28} />;
};

/** A row of the Medium one: face, name, and what they want with its dates. */
const DeckRow: React.FC<{ card: DeckCard; preview?: boolean }> = ({ card, preview }) => {
  const t = useTranslations("home");
  const tTimeOff = useTranslations("timeOff");
  const dates = useShortDates();
  const leave = card.kind === "TIME_OFF" || card.kind === "CANCELLATION";
  const context = useDecisionContext(leave ? card.request.id : null);
  const name = leave ? context.data?.requesterName ?? t("card.unnamed") : card.kind === "FAILED_RUN" ? card.run.ruleName ?? "" : card.task.title;
  const line = leave
    ? t("waitingOnYou.rowLine", {
        days: tTimeOff("amount.days", dayAmountArgs(card.request.requestedAmount)),
        type: t(`waitingOnYou.kinds.${card.kind === "CANCELLATION" ? "cancellation" : "timeOff"}`),
        dates: dates.range(card.request.startDate, card.request.endDate),
      })
    : t(`waitingOnYou.kinds.${card.kind === "FAILED_RUN" ? "failedRun" : card.kind === "AUTOMATION" ? "automation" : card.kind === "REVIEW" ? "review" : "task"}`);
  return (
    <li>
      <Link
        href={hrefOf(card)}
        tabIndex={preview ? -1 : undefined}
        className="-mx-2 flex items-center gap-3 rounded-control px-2 py-2.5 hover:bg-subtle"
      >
        <PersonFace name={name} size={28} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-medium text-primary">{name}</span>
          <span className="block truncate text-hint text-tertiary">{line}</span>
        </span>
      </Link>
    </li>
  );
};
