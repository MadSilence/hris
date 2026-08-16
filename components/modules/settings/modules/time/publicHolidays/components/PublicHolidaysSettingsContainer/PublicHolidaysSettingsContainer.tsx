"use client";

import React from "react";
import { PublicHolidaysSettingsComponent } from "../PublicHolidaysSettingsComponent";
import { usePublicHolidayCalendars } from "../../hooks/usePublicHolidayCalendars";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";

export default function PublicHolidaysSettingsContainer() {
  const { data: calendars, isLoading, error } = usePublicHolidayCalendars();
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) throw error;

  return (
    <PublicHolidaysSettingsComponent
      calendars={calendars ?? []}
      isLoading={isLoading}
    />
  );
}
