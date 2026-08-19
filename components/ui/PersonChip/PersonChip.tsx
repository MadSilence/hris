"use client";

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { cn } from "@/public/desact/src/components/ui/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  name: string;
  jobName?: string | null;
  avatarUrl?: string | null;
  initials: string;
  /** "row" is the compact list line; "card" is the square tile used on the block canvas. */
  variant?: "row" | "card";
  selected?: boolean;
  matched?: boolean;
  dimmed?: boolean;
  /** Archived people are shown but cannot be assigned anywhere. */
  archived?: boolean;
  /** Shown as a small label, e.g. the unit lead. */
  badge?: string;
  draggable?: boolean;
};

/**
 * Person tile for dense layouts. Forwards its ref and any extra props so a drag library can attach
 * to it without this component knowing anything about dragging.
 */
export const PersonChip = React.forwardRef<HTMLDivElement, Props>(function PersonChip(
  {
    name,
    jobName,
    avatarUrl,
    initials,
    variant = "row",
    selected,
    matched,
    dimmed,
    archived,
    badge,
    draggable,
    className,
    ...rest
  },
  ref,
) {
  const title = [name, jobName, archived ? "Archived" : null].filter(Boolean).join(" · ");

  const shared = cn(
    "border bg-white transition-colors",
    selected
      ? "border-brown-300 bg-brown-100"
      : "border-brown-200 hover:border-brown-300 hover:bg-brown-50",
    matched && "border-amber-400 ring-2 ring-amber-300",
    dimmed && "opacity-35",
    archived && "border-dashed bg-brown-50/70",
    draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
    className,
  );

  if (variant === "card") {
    return (
      <div ref={ref} title={title} className={cn("flex flex-col items-center gap-1 rounded-lg p-2", shared)} {...rest}>
        <Avatar className="h-9 w-9 flex-none">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
          <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
        </Avatar>
        <span className="w-full text-center">
          <span className="line-clamp-2 text-[11px] font-medium leading-tight text-brown-900">
            {name}
          </span>
          {jobName && !archived && (
            <span className="mt-0.5 block truncate text-[10px] leading-tight text-brown-400">
              {jobName}
            </span>
          )}
          {archived && (
            <span className="mt-0.5 block truncate text-[10px] leading-tight text-brown-500">
              Archived
            </span>
          )}
        </span>
        {badge && (
          <span className="rounded bg-brown-100 px-1 py-0.5 text-[9px] uppercase leading-none text-brown-500">
            {badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} title={title} className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5", shared)} {...rest}>
      <Avatar className="h-6 w-6 flex-none">
        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
        <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium leading-tight text-brown-900">
          {name}
        </span>
        {(jobName || archived) && (
          <span className="block truncate text-[10px] leading-tight text-brown-400">
            {archived ? "Archived" : jobName}
          </span>
        )}
      </span>
      {badge && (
        <span className="flex-none rounded bg-brown-100 px-1 py-0.5 text-[9px] uppercase leading-none text-brown-500">
          {badge}
        </span>
      )}
    </div>
  );
});
