"use client";

import React from "react";
import Link from "next/link";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/cn";
import { formatDisplayDate } from "@/lib/date";
import type { Task } from "@/models/lifecycle";
import { useMyTasks } from "@/components/modules/lifecycle/hooks";
import { HomeCard, HomeCardLink, HomeEmpty, HomeRowsSkeleton } from "@/components/modules/home/components/HomeCard";

export const MY_TASKS_LIMIT = 5;

/** Due first, the soonest first; a task with no date after every task with one. */
const byDue = (a: Task, b: Task) => {
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return a.title.localeCompare(b.title);
};

/**
 * Open tasks assigned to the reader — lifecycle and automation tasks — at most five. Read-only here: doing a
 * task happens on `/tasks`, where its fields and documents are, and home writes nothing but its own layout.
 */
export const MyTasksWidget: React.FC = () => {
  const query = useMyTasks(false);

  const open = (query.data ?? []).filter((task) => task.status === "OPEN" || task.status === "WAITING").sort(byDue);

  return (
    <HomeCard title="My tasks" action={<HomeCardLink href="/tasks">See all</HomeCardLink>}>
      {query.isLoading ? (
        <HomeRowsSkeleton rows={3} avatar={false} />
      ) : query.error ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : open.length === 0 ? (
        <HomeEmpty>Nothing assigned to you.</HomeEmpty>
      ) : (
        <ul className="flex flex-col gap-1">
          {open.slice(0, MY_TASKS_LIMIT).map((task) => (
            <li key={task.id}>
              <Link href="/tasks" className="-mx-2 flex items-center justify-between gap-3 rounded-control px-2 py-1.5 hover:bg-subtle">
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium text-primary">{task.title}</span>
                  {task.subject?.name && (
                    <span className="block truncate text-hint text-tertiary">For {task.subject.name}</span>
                  )}
                </span>
                {task.dueDate && (
                  <span className={cn("shrink-0 text-hint", task.dueReached ? "font-medium text-danger-text" : "text-tertiary")}>
                    {task.status === "WAITING" ? "Waiting · " : ""}
                    {formatDisplayDate(task.dueDate, { style: "medium", hideYear: true })}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </HomeCard>
  );
};
