"use client";

import React from "react";
import { PublicHolidayCalendarComponent } from "@/components/modules/settings/modules/time/publicHolidays/PublicHolidayCalendarComponent";

export type PublicHolidayItem = {
  id: string;
  date: string;
  name: string;
  type: "PUBLIC" | "COMPANY";
  paid: boolean;
};

export type PublicHolidayAssignmentItem = {
  id: string;
  type: "Everyone" | "Location" | "Department" | "Employee";
  name: string;
  membersCount: number;
};

export type PublicHolidayCalendarDetails = {
  id: string;
  name: string;
  country: string;
  region?: string;
  year: number;
  description: string;
  holidays: PublicHolidayItem[];
  assignments: PublicHolidayAssignmentItem[];
};

const calendar: PublicHolidayCalendarDetails = {
  id: "poland-2026",
  name: "Poland 2026",
  country: "Poland",
  year: 2026,
  description: "Default public holiday calendar for employees working in Poland.",
  holidays: [
    { id: "1", date: "2026-01-01", name: "New Year's Day", type: "PUBLIC", paid: true },
    { id: "2", date: "2026-01-06", name: "Epiphany", type: "PUBLIC", paid: true },
    { id: "3", date: "2026-05-01", name: "Labour Day", type: "PUBLIC", paid: true },
    { id: "4", date: "2026-05-03", name: "Constitution Day", type: "PUBLIC", paid: true },
  ],
  assignments: [
    { id: "1", type: "Location", name: "Poland office", membersCount: 84 },
    { id: "2", type: "Department", name: "People Operations Poland", membersCount: 12 },
  ],
};

export default function PublicHolidayCalendarContainer() {
  return <PublicHolidayCalendarComponent calendar={calendar}/>;
}
