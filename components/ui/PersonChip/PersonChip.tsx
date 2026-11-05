"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Badge } from "@/components/desact/badge";
import { cn } from "@/lib/cn";

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
  const t = useTranslations("common");
  const title = [name, jobName, archived ? t("status.archived") : null].filter(Boolean).join(" · ");

  // A node on a canvas (SPEC § 13.8): a card with the level-1 shadow; selected wears the accent's tint, a
  // search match the accent ring, an archived person a dashed edge.
  const shared = cn(
    "border bg-card transition-colors duration-(--duration-hover)",
    selected ? "border-accent-ring bg-accent-subtle" : "border-divider hover:border-strong hover:bg-subtle",
    matched && "border-accent ring-2 ring-accent-ring",
    dimmed && "opacity-35",
    archived && "border-dashed bg-subtle",
    draggable ? "cursor-grab active:cursor-grabbing active:shadow-drag" : "cursor-pointer",
    className,
  );

  if (variant === "card") {
    return (
      <div ref={ref} title={title} className={cn("flex flex-col items-center gap-1 rounded-popover p-2 shadow-raised", shared)} {...rest}>
        <Avatar className="size-9 flex-none">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
          <AvatarFallback name={name} className="text-hint">{initials}</AvatarFallback>
        </Avatar>
        <span className="w-full text-center">
          <span className="line-clamp-2 text-hint font-medium text-primary">{name}</span>
          {jobName && !archived && <span className="mt-0.5 block truncate text-hint text-tertiary">{jobName}</span>}
          {archived && <span className="mt-0.5 block truncate text-hint text-tertiary">{t("status.archived")}</span>}
        </span>
        {badge && <Badge size="sm">{badge}</Badge>}
      </div>
    );
  }

  return (
    <div ref={ref} title={title} className={cn("flex items-center gap-2 rounded-control px-2 py-1.5", shared)} {...rest}>
      <Avatar className="size-[22px] flex-none">
        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
        <AvatarFallback name={name} className="text-hint">{initials}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-hint font-medium text-primary">{name}</span>
        {(jobName || archived) && <span className="block truncate text-hint text-tertiary">{archived ? t("status.archived") : jobName}</span>}
      </span>
      {badge && <Badge size="sm" className="flex-none">{badge}</Badge>}
    </div>
  );
});
