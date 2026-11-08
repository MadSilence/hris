"use client";

import * as React from "react";
import { Alert02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/**
 * A banner over the canvas (`automations-editor` → Layout 10; PRODUCT-RULES § Banners): white with a hairline and
 * level 1, so it stands off the dots — never Mist on a canvas. A warning (F3) takes the pending status colours.
 */
export const CanvasBanner: React.FC<{
  tone?: "neutral" | "warning";
  icon?: IconSvgElement;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ tone = "neutral", icon, action, children }) => (
  <div
    role="status"
    className={cn(
      "flex w-full items-center gap-3 rounded-popover border px-4 py-3 text-body shadow-raised",
      tone === "warning"
        ? "border-status-pending-border bg-status-pending-bg text-status-pending-text"
        : "border-divider bg-card text-primary",
    )}
  >
    <Icon
      icon={icon ?? (tone === "warning" ? Alert02Icon : InformationCircleIcon)}
      size="sm"
      className={cn("shrink-0", tone === "warning" ? "text-status-pending-icon" : "text-secondary")}
    />
    <div className="min-w-0 flex-1">{children}</div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
