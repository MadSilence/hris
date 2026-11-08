"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/**
 * The frame of this part's windows (`automations-editor` § Values): a tool window 320 (Run history, Versions), the
 * run window 340 on the right, the test window 400 — radius 16, level 2, a title and ×. The editor places it; the
 * window fills the height it is given and scrolls its body.
 */
export const ToolWindow: React.FC<{
  title: React.ReactNode;
  /** A grey line over the title — the run window's "Run · started …". */
  eyebrow?: React.ReactNode;
  /** Icons before ×: the test run's expand. */
  actions?: React.ReactNode;
  width: 320 | 340 | 400;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}> = ({ title, eyebrow, actions, width, onClose, children, className, "aria-label": ariaLabel }) => {
  const t = useTranslations("automationsRuns");
  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        "flex max-h-full min-h-0 flex-col overflow-hidden rounded-card bg-card shadow-popover",
        width === 320 ? "w-[320px]" : width === 340 ? "w-[340px]" : "w-[400px]",
        className,
      )}
    >
      <header className="flex items-start gap-2 px-4 pt-3 pb-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1.5">
          {eyebrow && <p className="text-hint text-tertiary">{eyebrow}</p>}
          <h2 className="truncate text-card-title text-primary">{title}</h2>
        </div>
        {actions}
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("window.close")}>
          <Icon icon={Cancel01Icon} size="sm" />
        </Button>
      </header>
      {children}
    </section>
  );
};
