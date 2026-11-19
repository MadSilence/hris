"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Illustration, type Scene } from "@/components/illustrations";
import { cn } from "@/lib/cn";

/**
 * The frame of this part's windows (`automations-editor` § Values). On the left — Run history, Versions — it is the
 * editor's tool window (the designers' fixes E1–E3): joined to the tool block, full height, 320, a hairline and level
 * 3, a 53-high header with × at its right. On the right — the run window 340 — radius 16, level 2, a title and ×. The
 * editor places it; the window fills the height it is given and scrolls its body.
 */
export const ToolWindow: React.FC<{
  title: React.ReactNode;
  /** A grey line over the title — the run window's "Run · started …". */
  eyebrow?: React.ReactNode;
  /** Icons before ×: the test run's expand. */
  actions?: React.ReactNode;
  width: 320 | 340 | 400;
  /** `left`: a tool window joined to the tool block (E1–E2). */
  placement?: "left" | "right";
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}> = ({ title, eyebrow, actions, width, placement = "right", onClose, children, className, "aria-label": ariaLabel }) => {
  const t = useTranslations("automationsRuns");
  const left = placement === "left";
  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        "flex min-h-0 flex-col overflow-hidden bg-card",
        left ? "h-full rounded-card rounded-tl-none border border-divider shadow-dialog" : "max-h-full rounded-card shadow-popover",
        width === 320 ? "w-[320px]" : width === 340 ? "w-[340px]" : "w-[400px]",
        className,
      )}
    >
      {left ? (
        <header className="flex h-[53px] shrink-0 items-center gap-2 border-b border-divider pr-2 pl-4">
          <h2 className="min-w-0 flex-1 truncate text-card-title text-primary">{title}</h2>
          {actions}
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("window.close")}>
            <Icon icon={Cancel01Icon} />
          </Button>
        </header>
      ) : (
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
      )}
      {children}
    </section>
  );
};

/**
 * A window with nothing to show yet (the designers' fixes E3, rule I1): the picture, the title 15/22 600 and one line
 * 14/20, at most 240 wide, centred — horizontally and vertically — in the window under its header.
 */
export const WindowEmpty: React.FC<{ scene: Scene; title: string; description: string; action?: React.ReactNode }> = ({
  scene,
  title,
  description,
  action,
}) => (
  <div data-slot="empty-state" className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 px-5 py-6 text-center">
    <Illustration scene={scene} size="s" />
    <div className="flex max-w-60 flex-col gap-1">
      <p className="text-card-title text-primary">{title}</p>
      <p className="text-body text-tertiary">{description}</p>
    </div>
    {action}
  </div>
);
