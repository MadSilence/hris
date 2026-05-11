"use client";

import React from "react";
import { PublicHolidaysSettingsComponent } from "@/components/modules/settings/modules/time/publicHolidays/PublicHolidaysSettingsComponent";

export type PublicHolidayCalendarStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type PublicHolidayCalendarSource = "MANUAL" | "GOOGLE";

export type PublicHolidayCalendarListItem = {
  id: string;
  name: string;
  country: string;
  region?: string;
  year: number;
  holidaysCount: number;
  assignmentsSummary: string;
  status: PublicHolidayCalendarStatus;
  source: PublicHolidayCalendarSource;
};

const calendars: PublicHolidayCalendarListItem[] = [
  {
    id: "poland-2026",
    name: "Poland 2026",
    country: "Poland",
    year: 2026,
    holidaysCount: 13,
    assignmentsSummary: "Everyone in Poland",
    status: "ACTIVE",
    source: "GOOGLE",
  },
  {
    id: "global-company-days",
    name: "Global company days",
    country: "Global",
    year: 2026,
    holidaysCount: 3,
    assignmentsSummary: "Everyone",
    status: "ACTIVE",
    source: "MANUAL",
  },
  {
    id: "germany-bavaria-2026",
    name: "Germany - Bavaria 2026",
    country: "Germany",
    region: "Bavaria",
    year: 2026,
    holidaysCount: 15,
    assignmentsSummary: "12 employees",
    status: "DRAFT",
    source: "GOOGLE",
  },
];

export default function PublicHolidaysSettingsContainer() {
  return <PublicHolidaysSettingsComponent calendars={calendars}/>;
}
