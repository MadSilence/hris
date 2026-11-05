"use client";

import React, { useId } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card } from "@/components/desact/card";
import { Skeleton } from "@/components/desact/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { cn } from "@/lib/cn";

/**
 * One widget on home: a sentence-case heading, at most one action beside it, and the widget's own body
 * (HOME_AND_SEARCH.md § 1). One level of card — what is inside separates by space, not by boxes.
 */
export const HomeCard: React.FC<{
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, action, children, className }) => {
  const headingId = useId();
  return (
    <Card className={cn("h-fit gap-4 border-divider p-5", className)} aria-labelledby={headingId} role="region">
      <div className="flex items-center justify-between gap-3">
        <h3 id={headingId} className="text-body font-semibold text-primary">{title}</h3>
        {action}
      </div>
      {children}
    </Card>
  );
};

/** The one header action of a card: a quiet link. */
export const HomeCardLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link href={href} className="shrink-0 text-body font-medium text-accent-text underline-offset-4 hover:underline">
    {children}
  </Link>
);

/** A skeleton in the shape of the rows it stands in for: an avatar-sized dot and two lines. */
export const HomeRowsSkeleton: React.FC<{ rows?: number; avatar?: boolean }> = ({ rows = 3, avatar = true }) => (
  <div className="flex flex-col gap-3" aria-hidden data-testid="home-rows-skeleton">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-3">
        {avatar && <Skeleton className="h-8 w-8 shrink-0 rounded-pill" />}
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

/** One sentence of what the card is for when it has nothing to show. */
export const HomeEmpty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-body text-tertiary">{children}</p>
);

const initialsOf = (first?: string | null, last?: string | null) =>
  `${(first ?? "").trim().charAt(0)}${(last ?? "").trim().charAt(0)}`.toUpperCase() || "?";

/** The person's name, or "" when they have none — the row then says `home.card.unnamed`. */
export const fullName = (first?: string | null, last?: string | null) =>
  [first, last].filter((part) => part && part.trim()).join(" ");

/** A person on a line: face, name, and what the card has to say about them. */
export const HomePersonRow: React.FC<{
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  detail?: React.ReactNode;
  aside?: React.ReactNode;
  href?: string | null;
}> = ({ firstName, lastName, avatarUrl, detail, aside, href }) => {
  const t = useTranslations("home");
  const body = (
    <>
      <Avatar className="h-8 w-8 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
        <AvatarFallback className="bg-mist text-hint text-secondary">{initialsOf(firstName, lastName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-primary">{fullName(firstName, lastName) || t("card.unnamed")}</p>
        {detail && <div className="truncate text-hint text-tertiary">{detail}</div>}
      </div>
      {aside}
    </>
  );
  return href ? (
    <Link href={href} className="-mx-2 flex items-center gap-3 rounded-control px-2 py-1 hover:bg-subtle">
      {body}
    </Link>
  ) : (
    <div className="flex items-center gap-3 py-1">{body}</div>
  );
};

/** A two-state switch drawn as two quiet buttons, the inbox's filter style. */
export const HomeToggle = <T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
}) => (
  <div className="flex gap-1" role="group" aria-label={label}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={cn(
          "rounded-tag px-2.5 py-1 text-hint font-medium transition-colors",
          value === option.value ? "bg-accent-muted font-medium text-accent-text" : "text-tertiary hover:bg-subtle hover:text-primary",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);
