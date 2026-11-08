"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import type { AutomationRunStatus } from "@/models/automations";

/** A run's status in the system's tones (`design/screens/automations-run-history` § Words). */
export const RUN_STATUS_TONES: Record<AutomationRunStatus, StatusTone> = {
  IN_PROGRESS: "in-progress",
  FAILED: "declined",
  WAITING: "pending",
  SCHEDULED: "scheduled",
  DONE: "approved",
  SKIPPED: "inactive",
  CANCELLED: "archived",
};

export const RunStatusBadge: React.FC<{ status: AutomationRunStatus; size?: "sm" | "md" }> = ({ status, size }) => {
  const t = useTranslations("automations");
  return <StatusBadge status={RUN_STATUS_TONES[status]} label={t(`runStatus.${status}`)} size={size} />;
};
