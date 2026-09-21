"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { TableCell, TableRow } from "@/public/desact/src/components/ui/table";
import { cn } from "@/public/desact/src/components/ui/utils";
import type { AttendanceDay } from "@/models/attendance";
import { formatDayLabel, formatHours, parseHours } from "./month";

export type SaveDayResult = { error?: string; field?: "hours" | "description" };

type Props = {
  day: AttendanceDay;
  /** The company's today; a later day has not happened and is not offered for entry. */
  today: string;
  canRecord: boolean;
  onSave: (date: string, hours: number, description: string) => Promise<SaveDayResult>;
};

/** What the "Expected" cell says about a day. Empty when nothing is expected and nothing is special. */
export const expectedLabel = (day: AttendanceDay): string => {
  if (day.onLeave) return "Leave";
  if (day.holiday) return day.holiday;
  if (!day.workingDay) return "";
  return day.scheduledHours === null ? "Working day" : `${formatHours(day.scheduledHours)} h`;
};

/**
 * One day of the month: what was expected, what was recorded, and — when the caller may — the two
 * fields to record it. A refusal is shown on the row it belongs to, with the typed values kept,
 * because a card would slide away before the reader found which of thirty rows it meant.
 */
export const TimesheetDayRow: React.FC<Props> = ({ day, today, canRecord, onSave }) => {
  const initialHours = formatHours(day.hours);
  const initialDescription = day.description ?? "";
  const [hours, setHours] = useState(initialHours);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<SaveDayResult | null>(null);
  const [saving, setSaving] = useState(false);

  // A saved value coming back from the server is the new baseline.
  useEffect(() => {
    setHours(initialHours);
    setDescription(initialDescription);
  }, [initialHours, initialDescription]);

  const future = day.date > today;
  // Leave holds the day: hours cannot be recorded on it. A conflict (leave approved after the hours
  // were written) stays editable, because clearing the hours is how it is resolved.
  const editable = canRecord && !future && (!day.onLeave || day.conflict);
  const dirty = hours !== initialHours || description !== initialDescription;
  const muted = !day.workingDay || day.onLeave;

  const save = async () => {
    if (!dirty || saving) return;
    const parsed = hours.trim() === "" ? 0 : parseHours(hours);
    if (parsed === null) {
      setError({ error: "Enter the hours as a number, such as 7.5.", field: "hours" });
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onSave(day.date, parsed, description);
    setSaving(false);
    if (result.error) setError(result);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void save();
    }
  };

  return (
    <TableRow className={cn(muted && "bg-brown-50/40")} data-testid={`timesheet-row-${day.date}`}>
      <TableCell className={cn("w-24 whitespace-nowrap font-medium", muted && "text-muted-foreground")}>
        {formatDayLabel(day.date)}
      </TableCell>
      <TableCell className="w-40 whitespace-nowrap text-sm text-muted-foreground">{expectedLabel(day)}</TableCell>
      <TableCell className="w-32">
        {editable ? (
          <Input
            aria-label={`Hours on ${day.date}`}
            inputMode="decimal"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            onKeyDown={onKeyDown}
            aria-invalid={error?.field === "hours" || undefined}
            className="h-8 w-24"
          />
        ) : (
          <span className="text-sm">{formatHours(day.hours)}</span>
        )}
      </TableCell>
      <TableCell>
        {editable ? (
          <Input
            aria-label={`Description on ${day.date}`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onKeyDown={onKeyDown}
            aria-invalid={error?.field === "description" || undefined}
            className="h-8"
          />
        ) : (
          <span className="text-sm">{day.description ?? ""}</span>
        )}
        {day.conflict && (
          <p className="mt-1 text-xs text-warning-700">
            Hours are recorded on a day of approved leave. Clear them, or cancel the leave in Time Off.
          </p>
        )}
        {error?.error && (
          <p role="alert" className="mt-1 text-xs text-danger-700">{error.error}</p>
        )}
      </TableCell>
      <TableCell className="w-20 text-right">
        {editable && dirty && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={() => void save()}
            aria-label={`Save ${day.date}`}
          >
            <Check className="h-4 w-4"/>
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};
