"use client";

import React, { useId } from "react";
import Link from "next/link";
import { Card } from "@/public/desact/src/components/ui/card";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { cn } from "@/public/desact/src/components/ui/utils";

/**
 * One widget on home: a Title Case heading, at most one action beside it, and the widget's own body
 * (HOME_AND_SEARCH_DESIGN.md § 4.2). One level of card — what is inside separates by space, not by boxes.
 */
export const HomeCard: React.FC<{
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, action, children, className }) => {
  const headingId = useId();
  return (
    <Card className={cn("h-fit gap-4 border-brown-100 p-5", className)} aria-labelledby={headingId} role="region">
      <div className="flex items-center justify-between gap-3">
        <h3 id={headingId} className="text-base font-semibold text-brown-900">{title}</h3>
        {action}
      </div>
      {children}
    </Card>
  );
};

/** The one header action of a card: a quiet link. */
export const HomeCardLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link href={href} className="shrink-0 text-sm font-medium text-brown-600 underline-offset-2 hover:text-brown-800 hover:underline">
    {children}
  </Link>
);

/** A skeleton in the shape of the rows it stands in for: an avatar-sized dot and two lines. */
export const HomeRowsSkeleton: React.FC<{ rows?: number; avatar?: boolean }> = ({ rows = 3, avatar = true }) => (
  <div className="flex flex-col gap-3" aria-hidden data-testid="home-rows-skeleton">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-3">
        {avatar && <Skeleton className="h-8 w-8 shrink-0 rounded-full" />}
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
  <p className="text-sm text-muted-foreground">{children}</p>
);

const initialsOf = (first?: string | null, last?: string | null) =>
  `${(first ?? "").trim().charAt(0)}${(last ?? "").trim().charAt(0)}`.toUpperCase() || "?";

export const fullName = (first?: string | null, last?: string | null) =>
  [first, last].filter((part) => part && part.trim()).join(" ") || "Unnamed";

/** A person on a line: face, name, and what the card has to say about them. */
export const HomePersonRow: React.FC<{
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  detail?: React.ReactNode;
  aside?: React.ReactNode;
  href?: string | null;
}> = ({ firstName, lastName, avatarUrl, detail, aside, href }) => {
  const body = (
    <>
      <Avatar className="h-8 w-8 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
        <AvatarFallback className="bg-brown-100 text-xs text-brown-700">{initialsOf(firstName, lastName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brown-900">{fullName(firstName, lastName)}</p>
        {detail && <div className="truncate text-xs text-muted-foreground">{detail}</div>}
      </div>
      {aside}
    </>
  );
  return href ? (
    <Link href={href} className="-mx-2 flex items-center gap-3 rounded-md px-2 py-1 hover:bg-brown-50">
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
          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          value === option.value ? "bg-brown-100 text-brown-800" : "text-muted-foreground hover:bg-brown-50",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);
