"use client";

import React from "react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  RULE_STATUS_LABELS,
  RUN_STATUS_LABELS,
  STEP_STATUS_LABELS,
  type AutomationRuleStatus,
  type AutomationRunStatus,
  type AutomationStepStatus,
} from "@/models/automations";

/**
 * The shared chip, mapped — the way `ProcessStatusBadge` maps a process. One state per vocabulary asks
 * for attention and gets its own colour, as a process's partial failure does: a **paused** rule (a
 * structural break nobody has fixed yet) and a **failed** run or step. Archived is grey, never amber.
 */
const ATTENTION = {
  warning: "border-warning-200 bg-warning-50 text-warning-700",
  danger: "border-danger-200 bg-danger-50 text-danger-700",
};

export function RuleStatusBadge({ status }: { status: AutomationRuleStatus }) {
  if (status === "PAUSED") {
    return <Badge variant="outline" className={ATTENTION.warning}>{RULE_STATUS_LABELS[status]}</Badge>;
  }
  const shared = status === "ENABLED" ? "active" : status === "ARCHIVED" ? "archived" : "inactive";
  return <StatusBadge status={shared} label={RULE_STATUS_LABELS[status]} />;
}

export function RunStatusBadge({ status }: { status: AutomationRunStatus }) {
  if (status === "FAILED") {
    return <Badge variant="outline" className={ATTENTION.danger}>{RUN_STATUS_LABELS[status]}</Badge>;
  }
  const shared = status === "DONE" ? "active" : status === "CANCELLED" ? "archived" : "draft";
  return <StatusBadge status={shared} label={RUN_STATUS_LABELS[status]} />;
}

export function StepStatusBadge({ status }: { status: AutomationStepStatus }) {
  if (status === "FAILED") {
    return <Badge variant="outline" className={ATTENTION.danger}>{STEP_STATUS_LABELS[status]}</Badge>;
  }
  const shared = status === "DONE" ? "active" : status === "CANCELLED" || status === "STOPPED" ? "archived" : "draft";
  return <StatusBadge status={shared} label={STEP_STATUS_LABELS[status]} />;
}
