"use client";

import React from "react";
import { PublicHolidaysSettingsComponent } from "../PublicHolidaysSettingsComponent";
import { usePublicHolidayCalendars } from "../../hooks/usePublicHolidayCalendars";

export default function PublicHolidaysSettingsContainer() {
  const { data: calendars, isLoading, error } = usePublicHolidayCalendars();

  if (error) throw error;

  return (
    <PublicHolidaysSettingsComponent
      calendars={calendars ?? []}
      isLoading={isLoading}
    />
  );
}
