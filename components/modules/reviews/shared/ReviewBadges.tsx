"use client";

import React from "react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  REVIEW_ASSIGNMENT_STATUS_LABELS,
  REVIEW_CALIBRATION_STATUS_LABELS,
  REVIEW_CYCLE_STATUS_LABELS,
  REVIEW_PARTICIPANT_STATUS_LABELS,
  type ReviewAssignmentStatus,
  type ReviewCalibrationStatus,
  type ReviewCycleStatus,
  type ReviewParticipantStatus,
} from "@/models/reviews";

/** A cycle on the shared chip: a draft is neutral, a running cycle active, a closed one reads like archived. */
export function CycleStatusBadge({ status }: { status: ReviewCycleStatus }) {
  const shared = status === "ACTIVE" ? "active" : status === "CLOSED" ? "archived" : "draft";
  return <StatusBadge status={shared} label={REVIEW_CYCLE_STATUS_LABELS[status]} />;
}

/** A review: submitted is done, an open one is neutral until it is late — the one state that asks for attention. */
export function AssignmentStatusBadge({ status, overdue }: { status: ReviewAssignmentStatus; overdue?: boolean }) {
  if (status === "OPEN" && overdue) {
    return <Badge variant="outline" className="border-warning-200 bg-warning-50 text-warning-700">Overdue</Badge>;
  }
  const shared = status === "SUBMITTED" ? "active" : status === "OPEN" ? "draft" : "archived";
  return <StatusBadge status={shared} label={REVIEW_ASSIGNMENT_STATUS_LABELS[status]} />;
}

export function PacketStatusBadge({ status }: { status: ReviewParticipantStatus }) {
  const shared = status === "SHARED" || status === "ACKNOWLEDGED" ? "active" : status === "REMOVED" ? "archived" : "draft";
  return <StatusBadge status={shared} label={REVIEW_PARTICIPANT_STATUS_LABELS[status]} />;
}

/** A calibration session: open is in progress, closed is frozen and reads like archived. */
export function CalibrationStatusBadge({ status }: { status: ReviewCalibrationStatus }) {
  return <StatusBadge status={status === "OPEN" ? "active" : "archived"} label={REVIEW_CALIBRATION_STATUS_LABELS[status]} />;
}
