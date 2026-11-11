"use client";

import React, { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { Illustration, type Scene } from "@/components/illustrations";
import { cn } from "@/lib/cn";
import type { HomeWidgetSize } from "@/models/home";

/**
 * One widget on Home (`home-widgets` § System): white, radius 28, no border, the soft shadow; a title in Inter Tight
 * 20 with a link or a quiet line on its right. **It never grows with its content** — it fills its grid cell, and a
 * long list scrolls inside ({@link WidgetScroll}). Padding 24, 20 in a Small one.
 */
export const WidgetCard: React.FC<{
  title: string;
  size: HomeWidgetSize;
  /** The link or the quiet line at the right of the title. */
  aside?: React.ReactNode;
  /** The title itself is a link ("My time ↗"). */
  titleHref?: string;
  /** Beside the title — a counter pill. */
  titleExtra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** No title row: the widget draws its own (Next time off Small). */
  bare?: boolean;
}> = ({ title, size, aside, titleHref, titleExtra, children, className, bare }) => {
  const headingId = useId();
  return (
    <section
      role="region"
      aria-labelledby={headingId}
      data-widget-size={size}
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden rounded-widget bg-card shadow-widget",
        size === "S" ? "gap-2 p-5" : "gap-3 p-6",
        className,
      )}
    >
      <div className={cn("flex min-w-0 items-center justify-between gap-3", bare && "sr-only")}>
        <h2 id={headingId} className="flex min-w-0 items-center gap-2 text-widget-title text-primary">
          {titleHref ? (
            <Link href={titleHref} className="inline-flex min-w-0 items-center gap-1 hover:underline underline-offset-4">
              <span className="truncate">{title}</span>
              <Icon icon={ArrowUpRight01Icon} size="sm" className="text-tertiary" />
            </Link>
          ) : (
            <span className="truncate">{title}</span>
          )}
          {titleExtra}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
};

/** The link at the right of a title: "Inbox", "My time off", "See all". */
export const WidgetLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link href={href} className="shrink-0 text-label text-accent-text underline-offset-4 hover:underline">
    {children}
  </Link>
);

/** The quiet line at the right of a title: "2h ago". */
export const WidgetInfo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="shrink-0 text-hint text-tertiary">{children}</span>
);

/** The counter next to a title (PRODUCT-RULES 13): 22 high, the soft accent. */
export const CounterPill: React.FC<{ count: number }> = ({ count }) => (
  <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-pill bg-accent-subtle px-1.5 text-hint font-semibold text-accent-text">
    {count}
  </span>
);

/** A fact on a card: a Mist pill 24 high, 12 px, an optional icon before it. */
export const FactChip: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <span className="inline-flex h-6 items-center gap-1 rounded-pill bg-mist px-2.5 text-hint text-secondary">
    {icon}
    {children}
  </span>
);

/** A big number and its word on one baseline (PRODUCT-RULES 1: they never break apart). */
export const BigNumber: React.FC<{ value: React.ReactNode; word?: React.ReactNode; size: "s" | "m" | "l" | "xl" | "xxl"; className?: string }> = ({
  value,
  word,
  size,
  className,
}) => (
  <p className={cn("flex min-w-0 items-baseline gap-2 whitespace-nowrap", className)}>
    <span
      className={cn(
        "text-primary",
        size === "s" && "text-hero-s",
        size === "m" && "text-hero-m",
        size === "l" && "text-hero-l",
        size === "xl" && "text-hero-xl",
        size === "xxl" && "text-hero-xxl",
      )}
    >
      {value}
    </span>
    {word && <span className="truncate text-body text-secondary">{word}</span>}
  </p>
);

/** A list that scrolls inside the card, with a fade at its bottom edge and a thin thumb (PRODUCT-RULES 12). */
export const WidgetScroll: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("widget-fade min-h-0 flex-1 overflow-y-auto pb-4 [scrollbar-width:thin]", className)}>{children}</div>
);

/** Nothing for the first two seconds, then the skeleton (SPEC § 12): a quick read never flashes a shape. */
const useAfter = (ms: number) => {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShown(true), ms);
    return () => clearTimeout(timer);
  }, [ms]);
  return shown;
};

/** The skeleton in the card's own shape: a number or a few rows; every shape radius 8. */
export const WidgetSkeleton: React.FC<{ rows?: number; number?: boolean }> = ({ rows = 3, number = false }) => {
  const shown = useAfter(2000);
  return (
    <div className="flex flex-col gap-3" aria-hidden data-testid="widget-skeleton">
      {shown && (
        <>
          {number && <Skeleton className="h-10 w-24" />}
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-7 shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

/** Empty: the S illustration, a title, one line, at most one action. */
export const WidgetEmpty: React.FC<{
  scene: Scene;
  title: string;
  line: string;
  action?: React.ReactNode;
  size: HomeWidgetSize;
}> = ({ scene, title, line, action, size }) => (
  <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-center">
    {size !== "S" && <Illustration scene={scene} size="s" />}
    <p className="text-card-title text-primary">{title}</p>
    {size !== "S" && <p className="text-body text-secondary">{line}</p>}
    {action}
  </div>
);

/** Error: only this card fails — "Couldn't load {thing}" and Try again; the rest of Home works. */
export const WidgetError: React.FC<{ message: string; onRetry: () => void; size: HomeWidgetSize }> = ({ message, onRetry, size }) => {
  const t = useTranslations("home");
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-center" role="alert">
      {size !== "S" && <Illustration scene="something-broke" size="s" />}
      <p className="text-card-title text-primary">{message}</p>
      {size !== "S" && <p className="text-body text-secondary">{t("card.checkConnection")}</p>}
      <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
        {t("card.tryAgain")}
      </Button>
    </div>
  );
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

/** The person's name, or "" when they have none. */
export const fullName = (first?: string | null, last?: string | null) =>
  [first, last].filter((part) => part && part.trim()).join(" ");

/** A face; hovering it shows the full name and, when known, what the person does (a light tooltip). */
export const PersonFace: React.FC<{
  name: string;
  avatarUrl?: string | null;
  detail?: string | null;
  size?: 20 | 22 | 28 | 32 | 36 | 64;
  className?: string;
}> = ({ name, avatarUrl, detail, size = 28, className }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Avatar
        className={cn(
          "shrink-0 ring-2 ring-card",
          size === 20 && "size-5",
          size === 22 && "size-[22px]",
          size === 28 && "size-7",
          size === 32 && "size-8",
          size === 36 && "size-9",
          size === 64 && "size-16",
          className,
        )}
      >
        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
        <AvatarFallback name={name} className={size >= 36 ? "text-label" : "text-hint"}>
          {initialsOf(name)}
        </AvatarFallback>
      </Avatar>
    </TooltipTrigger>
    <TooltipContent title={name}>{detail}</TooltipContent>
  </Tooltip>
);

/** Text cut with … that shows its whole self in a tooltip (PRODUCT-RULES 18). */
export const Truncated: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className={cn("block min-w-0 truncate", className)}>{text}</span>
    </TooltipTrigger>
    <TooltipContent>{text}</TooltipContent>
  </Tooltip>
);
