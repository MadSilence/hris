"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { ErrorPage } from "@/components/feedback/ErrorPage";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError, NotFoundError } from "@/components/clients/exceptions";
import { cn } from "@/lib/cn";
import { HubLoadError } from "./HubStates";

/**
 * A hub page: the shell's 32 px padding plus 16 at the sides, so the hub keeps Home's calmer 48 (company-hub,
 * Changes to SPEC 2). `width` is CH02/CH03's 920 column, or full. It reaches the bottom of the viewport, so a state
 * can sit in the centre of the free area under the title (FIXES S2, U1, U4–U6) and CP02's agree bar at its foot (F4).
 */
export const HubPage: React.FC<{ children: React.ReactNode; width?: "full" | "column"; className?: string }> = ({
  children,
  width = "full",
  className,
}) => (
  <div className={cn("flex min-h-[calc(100dvh_-_2_*_var(--page-padding))] flex-col xl:px-4", width === "column" && "max-w-[952px]", className)}>
    {children}
  </div>
);

/** "Company hub" with the arrow: 13/20 500 accent, the arrow 16 accent, 4 apart (FIXES A4). */
export const BackLink: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <Link href={href} className="inline-flex w-fit items-center gap-1 text-hub-small font-medium text-accent no-underline hover:underline">
    <Icon icon={ArrowLeft01Icon} size="sm" />
    {label}
  </Link>
);

/** Breadcrumbs (CP02, CM08): every item an accent link, the last included; "/" 12/16 tertiary; 6 apart (FIXES A5). */
export const HubBreadcrumbs: React.FC<{ items: { href: string; label: string }[]; label: string; className?: string }> = ({
  items,
  label,
  className,
}) => (
  <nav aria-label={label} className={cn("flex min-w-0 items-center gap-1.5", className)}>
    {items.map((item, i) => (
      <React.Fragment key={item.href}>
        {i > 0 && (
          <span aria-hidden className="text-hint text-tertiary">
            /
          </span>
        )}
        <Link
          href={item.href}
          aria-current={i === items.length - 1 ? "page" : undefined}
          className="min-w-0 truncate text-label text-accent no-underline hover:underline"
        >
          {item.label}
        </Link>
      </React.Fragment>
    ))}
  </nav>
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
export const HubReadError: React.FC<{ error: unknown; back: { href: string; label: string }; onRetry?: () => void; title?: string }> = ({
  error,
  back,
  onRetry,
  title,
}) => {
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
  if (title && onRetry) return <HubLoadError error={error} title={title} onRetry={onRetry} />;
  return <ErrorState error={error} onRetry={onRetry} />;
};

/** A dialog's close (CM05, CM07): a 32 icon button, `cancel-01` 20 secondary (FIXES L1, O1). */
export const HubDialogClose: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const t = useTranslations("common");
  return (
    <Button type="button" variant="ghost" size="icon-sm" aria-label={t("actions.close")} onClick={onClick} className="shrink-0 text-secondary">
      <Icon icon={Cancel01Icon} size="md" />
    </Button>
  );
};
