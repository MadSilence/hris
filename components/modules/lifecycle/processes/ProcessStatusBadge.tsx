"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import type { ProcessStatus } from "@/models/lifecycle";

/**
 * A process's state on the status chip — onboarding's lifecycle of SPEC § 4.5: Scheduled → In progress → Done.
 * A partial failure is the one state that asks for attention, and the one red; cancelled is kept for history.
 */
const TONE: Record<ProcessStatus, StatusTone> = {
  PLANNED: "scheduled",
  IN_PROGRESS: "in-progress",
  COMPLETED: "approved",
  PARTIALLY_FAILED: "declined",
  CANCELLED: "archived",
};

export function ProcessStatusBadge({ status }: { status: ProcessStatus }) {
  const t = useTranslations("lifecycle");
  return <StatusBadge status={TONE[status]} label={t(`processStatus.${status}`)} />;
}
