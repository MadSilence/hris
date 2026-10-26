"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import type { AccessCheck } from "@/models/access";
import { useHolidayCalendarBinding } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useHolidayCalendarBinding";
import type { HolidayCalendarBindingKind } from "@/models/publicHolidays/binding";
import { HolidayCalendarBindingDialog } from "./HolidayCalendarBindingDialog";

type Props = {
  kind: HolidayCalendarBindingKind;
  /** The office or legal entity; null for the company default. */
  refId: string | null;
  /** How the dialog names the place: "Berlin", "the Company". */
  placeName: string;
  /** Archived places take no calendar. */
  readOnly?: boolean;
};

/** Who may change the field: assigning calendars, and editing the place itself (Java checks both). */
const writeChecks = (kind: HolidayCalendarBindingKind): AccessCheck[] => {
  const checks: AccessCheck[] = [{ resource: "ORG.PUBLIC_HOLIDAY_CALENDAR", action: "MANAGE" }];
  if (kind === "OFFICE") checks.push({ resource: "ORG.OFFICE", action: "EDIT" });
  if (kind === "LEGAL_ENTITY") checks.push({ resource: "ORG.LEGAL_ENTITY", action: "EDIT" });
  return checks;
};

const FALLBACK: Record<HolidayCalendarBindingKind, string> = {
  OFFICE: "People here get their legal entity's calendar, or the company default.",
  LEGAL_ENTITY: "People here get their office's calendar, or the company default.",
  COMPANY_DEFAULT: "People get only their office's or legal entity's calendar, or one of their own.",
};

/**
 * The Holiday Calendar field of an office, a legal entity or the company (PUBLIC_HOLIDAYS.md § "Who gets
 * which calendar"). It reads as a field, not as an automation — although setting it publishes a live rule,
 * whose run log is one click away.
 */
export const HolidayCalendarBindingSection: React.FC<Props> = ({ kind, refId, placeName, readOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const binding = useHolidayCalendarBinding(kind, refId);
  const current = binding.data;
  const inheriting = current?.inheriting ?? 0;

  return (
    <div className="space-y-3" data-test={`holiday-calendar-binding-${kind}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            <h2 className="text-base font-semibold">Holiday Calendar</h2>
          </div>
          <p className="m-0 text-sm text-muted-foreground">
            Which public holidays the people who work here get, unless they have a calendar of their own.
          </p>
        </div>
        {!readOnly && (
          <PermissionGate allOf={writeChecks(kind)}>
            <Button variant="outline" onClick={() => setIsOpen(true)} disabled={binding.isLoading}>
              {current?.calendarId ? "Change" : "Set Calendar"}
            </Button>
          </PermissionGate>
        )}
      </div>

      {binding.error ? (
        <ErrorState error={binding.error} />
      ) : binding.isLoading ? (
        <div className="h-5 w-48 animate-pulse rounded bg-brown-100" />
      ) : current?.calendarId ? (
        <div className="space-y-1">
          <p className="m-0 text-sm font-medium text-foreground">{current.calendarName}</p>
          <p className="m-0 text-xs text-muted-foreground">
            {inheriting === 1 ? "1 person inherits it" : `${inheriting} people inherit it`}
            {current.ruleId && (
              <>
                {" · "}
                <Link
                  href={`/settings/automation/automations/${current.ruleId}`}
                  className="text-foreground underline-offset-2 hover:underline"
                >
                  Run Log
                </Link>
              </>
            )}
          </p>
          {current.ruleStatus === "PAUSED" && (
            <p className="m-0 text-xs text-destructive">
              Paused: this calendar is no longer available. Choose a calendar again to apply it.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <p className="m-0 text-sm text-foreground">None</p>
          <p className="m-0 text-xs text-muted-foreground">{FALLBACK[kind]}</p>
        </div>
      )}

      {isOpen && (
        <HolidayCalendarBindingDialog
          isOpen={isOpen}
          onRequestCloseAction={() => setIsOpen(false)}
          kind={kind}
          refId={refId}
          placeName={placeName}
          current={current}
        />
      )}
    </div>
  );
};
