"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import React from "react";
import { PublicHolidaysSettingsComponent } from "../PublicHolidaysSettingsComponent";
import { usePublicHolidayCalendars } from "../../hooks/usePublicHolidayCalendars";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";

export default function PublicHolidaysSettingsContainer() {
  const { data: calendars, isLoading, error } = usePublicHolidayCalendars();
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) return <ErrorState error={error} />;

  return (
    <PublicHolidaysSettingsComponent
      calendars={calendars ?? []}
      isLoading={isLoading}
    />
  );
}
