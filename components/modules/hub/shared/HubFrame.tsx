"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { ErrorPage } from "@/components/feedback/ErrorPage";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError, NotFoundError } from "@/components/clients/exceptions";
import { cn } from "@/lib/cn";

/**
 * A hub page: the shell's 32 px padding plus 16 at the sides, so the hub keeps Home's calmer 48 (company-hub,
 * Changes to SPEC 2). `width` is CH02/CH03's 920 column, or full.
 */
export const HubPage: React.FC<{ children: React.ReactNode; width?: "full" | "column"; className?: string }> = ({
  children,
  width = "full",
  className,
}) => (
  <div className={cn("flex flex-col xl:px-4", width === "column" && "max-w-[952px]", className)}>{children}</div>
);

/** "Company hub" with the arrow (link button, 13/18). */
export const BackLink: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <Link href={href} className="inline-flex w-fit items-center gap-1 text-label text-secondary no-underline hover:text-primary">
    <Icon icon={ArrowLeft01Icon} size="sm" />
    {label}
  </Link>
);

/** The hub's page title (32/40 600, company-hub Changes to SPEC 1). */
export const HubTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h1 className={cn("text-hub-title text-primary", className)}>{children}</h1>
);

/** A column heading (22/28; Changes to SPEC 6). */
export const HubHeading: React.FC<{ children: React.ReactNode; id?: string; className?: string }> = ({ children, id, className }) => (
  <h2 id={id} className={cn("text-hub-heading text-primary", className)}>{children}</h2>
);

/**
 * A post or page that could not be opened: 403 "This page is private" (HB00020, outside the reader's audience),
 * 404 for one deleted or unpublished, otherwise the read's own error state.
 */
export const HubReadError: React.FC<{ error: unknown; back: { href: string; label: string }; onRetry?: () => void }> = ({ error, back, onRetry }) => {
  const t = useTranslations("hub");
  const action = (
    <Button asChild>
      <Link href={back.href} className="no-underline">
        {back.label}
      </Link>
    </Button>
  );
  if (error instanceof ForbiddenError) {
    return <ErrorPage scene="policies" title={t("errors.privateTitle")} line={t("errors.privateLine")} actions={action} />;
  }
  if (error instanceof NotFoundError) {
    return <ErrorPage scene="no-results" title={t("errors.goneTitle")} line={t("errors.goneLine")} actions={action} />;
  }
  return <ErrorState error={error} onRetry={onRetry} />;
};
