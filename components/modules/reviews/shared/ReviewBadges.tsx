"use client";

import React from "react";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
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

/*
 * Reviews on the status chip — SPEC § 4.5's lifecycle: Scheduled → In review → Submitted · Overdue.
 */

/** A cycle: a draft is a draft, a running cycle is in review, a closed one is kept for history. */
const CYCLE: Record<ReviewCycleStatus, StatusTone> = { DRAFT: "draft", ACTIVE: "in-progress", CLOSED: "archived" };

export function CycleStatusBadge({ status }: { status: ReviewCycleStatus }) {
  return <StatusBadge status={CYCLE[status]} label={REVIEW_CYCLE_STATUS_LABELS[status]} />;
}

/** A review to write: open until submitted, Overdue once late — the one state that asks for attention. */
const ASSIGNMENT: Record<ReviewAssignmentStatus, StatusTone> = {
  NOMINATED: "pending",
  OPEN: "in-progress",
  SUBMITTED: "approved",
  DECLINED: "declined",
  REASSIGNED: "archived",
  CANCELLED: "archived",
};

export function AssignmentStatusBadge({ status, overdue }: { status: ReviewAssignmentStatus; overdue?: boolean }) {
  if (status === "OPEN" && overdue) {
    return <StatusBadge status="declined" label="Overdue" />;
  }
  return <StatusBadge status={ASSIGNMENT[status]} label={REVIEW_ASSIGNMENT_STATUS_LABELS[status]} />;
}

/** A person's review packet: collecting, then waiting for its approver, then shared and acknowledged. */
const PACKET: Record<ReviewParticipantStatus, StatusTone> = {
  COLLECTING: "in-progress",
  AWAITING_APPROVAL: "pending",
  SHARED: "approved",
  ACKNOWLEDGED: "approved",
  REMOVED: "archived",
};

export function PacketStatusBadge({ status }: { status: ReviewParticipantStatus }) {
  return <StatusBadge status={PACKET[status]} label={REVIEW_PARTICIPANT_STATUS_LABELS[status]} />;
}

/** A calibration session: open is in review, closed is frozen and kept for history. */
export function CalibrationStatusBadge({ status }: { status: ReviewCalibrationStatus }) {
  return (
    <StatusBadge status={status === "OPEN" ? "in-progress" : "archived"} label={REVIEW_CALIBRATION_STATUS_LABELS[status]} />
  );
}
