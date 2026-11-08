"use client";

import * as React from "react";
import { PauseIcon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { Icon } from "@/components/desact/icon";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import type { AutomationStatusBadgeProps } from "@/components/modules/automations/contracts";
import type { AutomationStatus } from "@/models/automations";

const TONES: Record<Exclude<AutomationStatus, "PAUSED">, StatusTone> = {
  ACTIVE: "approved",
  DRAFT: "draft",
  ARCHIVED: "archived",
};

/**
 * An automation's status (`automations-list`, Q-7): Active is approved, Draft the dashed draft, Archived archived.
 * **Paused has no tone of its own**: it wears the inactive tone with the `pause` icon. `StatusBadge` ties the icon to
 * the tone and takes no other, so Paused is drawn here with the inactive tone's own classes — the same pill, the
 * same sizes (`StatusBadge` would need an `icon` prop to draw it itself).
 */
export const AutomationStatusBadge: React.FC<AutomationStatusBadgeProps & { size?: "sm" | "md" }> = ({ status, size = "md" }) => {
  const t = useTranslations("automations");
  if (status !== "PAUSED") return <StatusBadge status={TONES[status]} label={t(`status.${status}`)} size={size} />;
  return (
    <span
      data-slot="status-badge"
      data-status="inactive"
      className={
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-pill bg-status-inactive-bg text-hint font-semibold " +
        `whitespace-nowrap text-status-inactive-text ${size === "sm" ? "h-5 px-1.5" : "h-6 px-2"}`
      }
    >
      <Icon icon={PauseIcon} size="sm" className="size-3.5 text-status-inactive-icon" />
      {t("status.PAUSED")}
    </span>
  );
};
