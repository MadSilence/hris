"use client";

import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";

/**
 * Whether the caller may change holiday calendars — create, edit days, duplicate, archive, delete,
 * assign people, export.
 *
 * The resource's actions are VIEW and MANAGE, so MANAGE is its only write right. Somebody holding VIEW
 * alone was offered every action and refused on each click. UX only: the backend refuses regardless.
 * Unknown (access still loading) reads as "may not", so a control never flickers in and out.
 */
export const useCanManagePublicHolidayCalendars = (): boolean => {
  const { access } = useAccess();
  return canAccess({ access, resource: "ORG.PUBLIC_HOLIDAY_CALENDAR", action: "MANAGE" });
};
