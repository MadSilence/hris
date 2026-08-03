"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiPeopleViewsService } from "@/api/modules/peopleViews/services/hrisApiPeopleViewsService";
import type { PeopleView, ViewPayload } from "@/models/peopleView";

export type ViewActionResult<T> = {
  status: ActionStatus;
  data?: T;
  errorMessage?: string;
};

export async function createViewAction(
  name: string,
  payload: ViewPayload,
): Promise<ViewActionResult<PeopleView>> {
  try {
    const data = await hrisApiPeopleViewsService.create({ name, payload });
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("createViewAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to save the view." };
  }
}

export async function updateViewAction(
  id: string,
  name: string,
  payload: ViewPayload,
): Promise<ViewActionResult<PeopleView>> {
  try {
    const data = await hrisApiPeopleViewsService.update(id, { name, payload });
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("updateViewAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to update the view." };
  }
}

export async function duplicateViewAction(id: string): Promise<ViewActionResult<PeopleView>> {
  try {
    const data = await hrisApiPeopleViewsService.duplicate(id);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("duplicateViewAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to duplicate the view." };
  }
}

export async function deleteViewAction(id: string): Promise<ViewActionResult<void>> {
  try {
    await hrisApiPeopleViewsService.remove(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("deleteViewAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to delete the view." };
  }
}

export async function shareViewAction(payload: ViewPayload): Promise<ViewActionResult<{ token: string }>> {
  try {
    const data = await hrisApiPeopleViewsService.share(payload);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("shareViewAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to create a share link." };
  }
}
