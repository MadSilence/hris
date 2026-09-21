"use client";

import React from "react";
import type { AttendanceSummary } from "@/models/attendance";
import { formatHours } from "./month";

/**
 * The month in numbers — hours only. The amount owed needs an hourly rate, which does not exist yet
 * (`NEED_TO_DISCUSS.md` § 24), so this shows no money rather than a guess.
 *
 * The scheduled total is left out, not zeroed, when the norm is unknown: the company week says which
 * days are worked, not for how long.
 */
export const TimesheetSummary: React.FC<{ summary: AttendanceSummary }> = ({ summary }) => {
  const tiles: { label: string; value: string }[] = [
    { label: "Recorded Hours", value: formatHours(summary.recordedHours) || "0" },
    { label: "Days Recorded", value: String(summary.daysRecorded) },
    { label: "Working Days", value: String(summary.workingDays) },
    { label: "Days Missing", value: String(summary.missingDays) },
    { label: "Leave Days", value: String(summary.leaveDays) },
  ];
  if (summary.scheduledHours !== null) {
    tiles.splice(1, 0, { label: "Scheduled Hours", value: formatHours(summary.scheduledHours) || "0" });
  }

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Month summary">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-lg border border-brown-200 bg-white px-4 py-3">
          <dt className="text-xs text-muted-foreground">{tile.label}</dt>
          <dd className="mt-1 text-xl font-semibold text-brown-900">{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
};
