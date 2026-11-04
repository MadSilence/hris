"use client";

import React from "react";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import {
  RULE_STATUS_LABELS,
  RUN_STATUS_LABELS,
  STEP_STATUS_LABELS,
  type AutomationRuleStatus,
  type AutomationRunStatus,
  type AutomationStepStatus,
} from "@/models/automations";

/**
 * An automation's states on the status chip (SPEC § 4.5), mapped the way `ProcessStatusBadge` maps a process.
 * A **paused** rule waits on somebody to fix it — Pending; a **failed** run or step is Declined, the one red.
 */
const RULE: Record<AutomationRuleStatus, StatusTone> = {
  ENABLED: "approved",
  DISABLED: "inactive",
  PAUSED: "pending",
  ARCHIVED: "archived",
};

const RUN: Record<AutomationRunStatus, StatusTone> = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in-progress",
  DONE: "approved",
  SKIPPED: "inactive",
  FAILED: "declined",
  CANCELLED: "archived",
};

const STEP: Record<AutomationStepStatus, StatusTone> = {
  SCHEDULED: "scheduled",
  DONE: "approved",
  SKIPPED: "inactive",
  FAILED: "declined",
  CANCELLED: "archived",
  STOPPED: "archived",
};

export function RuleStatusBadge({ status }: { status: AutomationRuleStatus }) {
  return <StatusBadge status={RULE[status]} label={RULE_STATUS_LABELS[status]} />;
}

export function RunStatusBadge({ status }: { status: AutomationRunStatus }) {
  return <StatusBadge status={RUN[status]} label={RUN_STATUS_LABELS[status]} />;
}

export function StepStatusBadge({ status }: { status: AutomationStepStatus }) {
  return <StatusBadge status={STEP[status]} label={STEP_STATUS_LABELS[status]} />;
}
