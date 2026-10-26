"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPeopleImportService } from "@/api/modules/peopleImport/services";
import type { PeopleImportDTO, PeopleImportUpdateRequest } from "@/api/modules/peopleImport/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

// The steps of people import. The upload is not here: its body can exceed the action limit, so it
// goes through `app/api/people-imports` (see PeopleImportRoutes).

export async function updatePeopleImportAction(input: {
  id: string;
  body: PeopleImportUpdateRequest;
}): Promise<ActionResult<PeopleImportDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisPeopleImportService.update(input.id, input.body) };
  } catch (error) {
    return toActionError(error, "updatePeopleImportAction");
  }
}

export async function checkPeopleImportAction(id: string): Promise<ActionResult<PeopleImportDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisPeopleImportService.check(id) };
  } catch (error) {
    return toActionError(error, "checkPeopleImportAction");
  }
}

export async function applyPeopleImportAction(id: string): Promise<ActionResult<PeopleImportDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisPeopleImportService.apply(id) };
  } catch (error) {
    return toActionError(error, "applyPeopleImportAction");
  }
}

export async function invitePeopleImportAction(id: string): Promise<ActionResult<PeopleImportDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisPeopleImportService.invite(id) };
  } catch (error) {
    return toActionError(error, "invitePeopleImportAction");
  }
}

export async function discardPeopleImportAction(id: string): Promise<ActionResult<PeopleImportDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisPeopleImportService.discard(id) };
  } catch (error) {
    return toActionError(error, "discardPeopleImportAction");
  }
}
