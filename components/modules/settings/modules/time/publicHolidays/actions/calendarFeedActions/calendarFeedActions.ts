"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisCalendarFeedsService } from "@/api/modules/calendarFeeds/services";
import type { CalendarFeedDTO, CalendarFeedKind } from "@/api/modules/calendarFeeds/dto";

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
    console.error("issueCalendarFeedAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Could not create the subscription link." };
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
    console.error("rotateCalendarFeedAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Could not reset the subscription link." };
  }
};

export const revokeCalendarFeedAction = async (
  submission: { kind: CalendarFeedKind; calendarId?: string | null }
): Promise<{ status: ActionStatus; errorMessage?: string }> => {
  try {
    await hrisCalendarFeedsService.revoke(submission.kind, submission.calendarId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("revokeCalendarFeedAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Could not turn off the subscription." };
  }
};
