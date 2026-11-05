"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import {
  REVIEW_ASSIGNMENT_STATUS_KEYS,
  REVIEW_CALIBRATION_STATUS_KEYS,
  REVIEW_CYCLE_STATUS_KEYS,
  REVIEW_PARTICIPANT_STATUS_KEYS,
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
  const t = useTranslations("reviews");
  return <StatusBadge status={CYCLE[status]} label={t(REVIEW_CYCLE_STATUS_KEYS[status])} />;
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
  const t = useTranslations("reviews");
  if (status === "OPEN" && overdue) {
    return <StatusBadge status="declined" label={t("status.assignment.overdue")} />;
  }
  return <StatusBadge status={ASSIGNMENT[status]} label={t(REVIEW_ASSIGNMENT_STATUS_KEYS[status])} />;
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
  const t = useTranslations("reviews");
  return <StatusBadge status={PACKET[status]} label={t(REVIEW_PARTICIPANT_STATUS_KEYS[status])} />;
}

/** A calibration session: open is in review, closed is frozen and kept for history. */
export function CalibrationStatusBadge({ status }: { status: ReviewCalibrationStatus }) {
  const t = useTranslations("reviews");
  return (
    <StatusBadge status={status === "OPEN" ? "in-progress" : "archived"} label={t(REVIEW_CALIBRATION_STATUS_KEYS[status])} />
  );
}
