"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisCalendarFeedsService } from "@/api/modules/calendarFeeds/services";
import type { CalendarFeedDTO, CalendarFeedKind } from "@/api/modules/calendarFeeds/dto";
import { toActionError } from "@/lib/errors/withActionError";

export type CalendarFeedActionOutput = {
  status: ActionStatus;
  data?: CalendarFeedDTO;
  errorMessage?: string;
};

/** Returns the existing subscription URL, minting one on first ask. */
export const issueCalendarFeedAction = async (
  submission: { kind: CalendarFeedKind; calendarId?: string | null }
): Promise<CalendarFeedActionOutput> => {
  try {
    const data = await hrisCalendarFeedsService.issue(submission.kind, submission.calendarId);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "calendarFeedActions");
  }
};

/** Invalidates the current URL and hands back a new one — for when a link has leaked. */
export const rotateCalendarFeedAction = async (
  submission: { kind: CalendarFeedKind; calendarId?: string | null }
): Promise<CalendarFeedActionOutput> => {
  try {
    const data = await hrisCalendarFeedsService.rotate(submission.kind, submission.calendarId);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "calendarFeedActions");
  }
};

export const revokeCalendarFeedAction = async (
  submission: { kind: CalendarFeedKind; calendarId?: string | null }
): Promise<{ status: ActionStatus; errorMessage?: string }> => {
  try {
    await hrisCalendarFeedsService.revoke(submission.kind, submission.calendarId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "calendarFeedActions");
  }
};
