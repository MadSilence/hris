"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiPeopleViewsService } from "@/api/modules/peopleViews/services/hrisApiPeopleViewsService";
import type { PeopleView, ViewPayload } from "@/models/peopleView";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "peopleViewActions");
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
    return toActionError(error, "peopleViewActions");
  }
}

export async function duplicateViewAction(id: string): Promise<ViewActionResult<PeopleView>> {
  try {
    const data = await hrisApiPeopleViewsService.duplicate(id);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "peopleViewActions");
  }
}

export async function deleteViewAction(id: string): Promise<ViewActionResult<void>> {
  try {
    await hrisApiPeopleViewsService.remove(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "peopleViewActions");
  }
}

export async function shareViewAction(payload: ViewPayload): Promise<ViewActionResult<{ token: string }>> {
  try {
    const data = await hrisApiPeopleViewsService.share(payload);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "peopleViewActions");
  }
}
