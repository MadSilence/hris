"use client";

import React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { ActionStatus } from "@/components/models/ActionStatus";
import { cn } from "@/lib/cn";
import { useShortDates } from "@/lib/date";
import { showActionError } from "@/lib/errors/errorToast";
import type { Task } from "@/models/lifecycle";
import { lifecycleQueryKeys, useMyTasks } from "@/components/modules/lifecycle/hooks";
import { completeMyTaskAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { scheduleWrite, showUndoToast, usePendingWrites } from "@/components/modules/home/deferred";
import { isoDateInZone } from "@/components/modules/home/utils/zonedTime";
import {
  BigNumber,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetLink,
  WidgetScroll,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";

/** A task Home can close in one tick: nothing to fill, attach or answer. Everything else opens on /tasks. */
export const TICKABLE_KINDS = new Set<Task["kind"]>(["TODO", "ACKNOWLEDGE"]);

/** The key a held "done" is kept under in the deferred queue. */
export const taskDoneKey = (taskId: string) => `task-done:${taskId}`;

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Overdue first, then by due date; a task with no date after every task with one. */
const byDue = (a: Task, b: Task) => {
  if (a.dueReached !== b.dueReached) return a.dueReached ? -1 : 1;
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return a.title.localeCompare(b.title);
};

/** Ticks a task done on Home: held for the undo window, then sent (DECISIONS.md § "The home redesign"). */
export const useTickTask = () => {
  const t = useTranslations("home");
  const queryClient = useQueryClient();
  return (task: Task) => {
    const undo = scheduleWrite(taskDoneKey(task.id), async () => {
      const result = await completeMyTaskAction({ id: task.id });
      if (result.status !== ActionStatus.SUCCESS) showActionError(result);
      await queryClient.invalidateQueries({ queryKey: lifecycleQueryKeys.myTasksRoot });
    });
    showUndoToast(t("myTasks.done"), t("card.undo"), () => {
      undo();
    });
  };
};

/** The round checkbox of a task (SPEC § 13.11); ticked, it fills with the accent. */
const TaskCheck: React.FC<{ done: boolean; disabled: boolean; label: string; onTick: () => void }> = ({ done, disabled, label, onTick }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={done}
    aria-label={label}
    disabled={disabled || done}
    onClick={onTick}
    className={cn(
      "flex size-[18px] shrink-0 items-center justify-center rounded-pill border-[1.5px] transition-colors",
      done ? "border-accent bg-accent text-on-accent" : "border-strong hover:border-accent",
      disabled && !done && "opacity-50",
    )}
  >
    {done && <Icon icon={Tick02Icon} size="sm" className="size-3" />}
  </button>
);

/**
 * Tasks assigned to the reader, by processes and by people (`home-widgets` § 8): overdue first, then by due date.
 * **Ticking one closes it on Home** — held five seconds with Undo — and it stays crossed out until the day ends, then
 * leaves (PRODUCT-RULES 15). Only a task with nothing to fill can be ticked here; the rest open on /tasks.
 */
export const MyTasksWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  const settings = useUserSettings();
  const query = useMyTasks(true);
  const pending = usePendingWrites();
  const tick = useTickTask();
  const today = isoDateInZone(new Date(), settings.data?.companyTimeZone);
  const weekAgo = addDays(today, -6);
  const weekAhead = addDays(today, 7);
  const title = t("widgets.myTasks.title");

  if (query.isLoading) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetSkeleton number={size === "S"} rows={size === "S" ? 0 : 3} />
      </WidgetCard>
    );
  }
  if (query.error) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetError size={size} message={t("card.couldNotLoad", { thing: "tasks" })} onRetry={() => void query.refetch()} />
      </WidgetCard>
    );
  }

  const all = query.data ?? [];
  const isDone = (task: Task) => task.status === "DONE" || pending.has(taskDoneKey(task.id));
  const doneToday = (task: Task) => isDone(task) && (pending.has(taskDoneKey(task.id)) || (task.completedAt ?? "").slice(0, 10) === today);
  const open = all.filter((task) => (task.status === "OPEN" || task.status === "WAITING") && !pending.has(taskDoneKey(task.id))).sort(byDue);
  const shown = [...open, ...all.filter(doneToday)];
  const dueToday = open.filter((task) => task.dueDate !== null && task.dueDate <= today).length;
  const overdue = open.filter((task) => task.dueReached).length;
  const doneThisWeek = all.filter((task) => isDone(task) && ((task.completedAt ?? today).slice(0, 10) >= weekAgo)).length;

  if (shown.length === 0) {
    return (
      <WidgetCard title={title} size={size} aside={size === "S" ? undefined : <WidgetLink href="/tasks">{t("card.seeAll")}</WidgetLink>}>
        <WidgetEmpty size={size} scene="tasks" title={t("myTasks.emptyTitle")} line={t("myTasks.emptyLine")} />
      </WidgetCard>
    );
  }

  if (size === "S") {
    return (
      <WidgetCard title={title} size={size}>
        <BigNumber size="s" value={open.length} word={t("myTasks.toDo")} />
        {dueToday > 0 && <p className="text-label text-accent-text">{t("myTasks.dueToday", { count: dueToday })}</p>}
      </WidgetCard>
    );
  }

  const href = (task: Task) =>
    task.kind === "REVIEW" ? `/reviews/write/by-task/${task.id}`
      : task.kind === "NOMINATE_PEERS" || task.kind === "APPROVE_PEERS" || task.kind === "APPROVE_REVIEW" ? `/reviews/steps/by-task/${task.id}`
      : "/tasks";

  const row = (task: Task, withDay: boolean) => {
    const done = isDone(task);
    const from = task.processType ? t(`processes.types.${task.processType}`) : task.subject?.name ?? "";
    const when = task.dueDate ? (task.dueDate === today ? t("card.today") : dates.date(task.dueDate, { weekday: true })) : "";
    return (
      <li key={task.id} className="flex items-start gap-3 py-2.5">
        <span className="pt-0.5">
          <TaskCheck
            done={done}
            disabled={Boolean(preview) || !TICKABLE_KINDS.has(task.kind) || task.status === "WAITING"}
            label={t("myTasks.markDone", { title: task.title })}
            onTick={() => tick(task)}
          />
        </span>
        <Link href={href(task)} tabIndex={preview ? -1 : undefined} className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <span className="min-w-0">
            <span className={cn("block truncate text-body", done ? "text-tertiary line-through" : "font-medium text-primary")}>{task.title}</span>
            {from && (
              <span className="block truncate text-hint text-tertiary">
                {withDay || !when ? from : t("myTasks.from", { when, from })}
              </span>
            )}
          </span>
          {!done && task.dueReached ? (
            <span className="flex shrink-0 flex-col items-end">
              <span className="text-hint font-medium text-danger-text">{t("myTasks.overdue")}</span>
              {task.dueDate && <span className="text-hint text-tertiary">{dates.date(task.dueDate, { weekday: true })}</span>}
            </span>
          ) : withDay && when ? (
            <span className="shrink-0 text-hint text-tertiary">{when}</span>
          ) : null}
        </Link>
      </li>
    );
  };

  if (size === "M") {
    return (
      <WidgetCard title={title} size={size} aside={<WidgetLink href="/tasks">{t("card.seeAll")}</WidgetLink>}>
        <WidgetScroll>
          <ul className="flex flex-col divide-y divide-divider">{shown.map((task) => row(task, false))}</ul>
        </WidgetScroll>
      </WidgetCard>
    );
  }

  const todayColumn = shown.filter((task) => task.dueReached || (task.dueDate !== null && task.dueDate <= today) || doneToday(task));
  const laterColumn = shown.filter((task) => !todayColumn.includes(task) && (task.dueDate === null || task.dueDate <= weekAhead));

  return (
    <WidgetCard title={title} size={size} aside={<WidgetLink href="/tasks">{t("card.seeAll")}</WidgetLink>}>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <div className="flex min-h-0 flex-col gap-1 rounded-card bg-accent-subtle px-3.5 py-3">
          <p className="text-hint font-semibold text-accent-text">{t("myTasks.today")}</p>
          <WidgetScroll>
            <ul className="flex flex-col divide-y divide-divider">{todayColumn.map((task) => row(task, true))}</ul>
          </WidgetScroll>
        </div>
        <div className="flex min-h-0 flex-col gap-1 px-1 py-3">
          <p className="text-hint font-semibold text-tertiary">{t("myTasks.thisWeek")}</p>
          <WidgetScroll>
            <ul className="flex flex-col divide-y divide-divider">{laterColumn.map((task) => row(task, true))}</ul>
          </WidgetScroll>
        </div>
      </div>
      <p className="text-hint text-tertiary">{t("myTasks.footer", { open: open.length, overdue, done: doneThisWeek })}</p>
    </WidgetCard>
  );
};
