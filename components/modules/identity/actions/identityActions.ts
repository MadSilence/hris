"use server";

// Every export is an explicit `async function` — a `const` does not survive as a server action.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisIdentityService } from "@/api/modules/identity/services";
import type {
  IdentityConnectionDTO,
  IdentityConnectionUpdate,
  IdpGroupDTO,
  IssuedScimToken,
  TestResultDTO,
} from "@/api/modules/identity/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export async function saveIdentityConnectionAction(body: IdentityConnectionUpdate): Promise<ActionResult<IdentityConnectionDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisIdentityService.saveConnection(body) };
  } catch (error) {
    return toActionError(error, "saveIdentityConnectionAction");
  }
}

export async function testIdentityConnectionAction(): Promise<ActionResult<TestResultDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisIdentityService.test() };
  } catch (error) {
    return toActionError(error, "testIdentityConnectionAction");
  }
}

export async function issueScimTokenAction(expiresInMonths: number): Promise<ActionResult<IssuedScimToken>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisIdentityService.issueToken(expiresInMonths) };
  } catch (error) {
    return toActionError(error, "issueScimTokenAction");
  }
}

export async function revokeScimTokenAction(id: string): Promise<ActionResult<void>> {
  try {
    await hrisIdentityService.revokeToken(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "revokeScimTokenAction");
  }
}

export async function mapIdpGroupAction(groupId: string, roleIds: string[]): Promise<ActionResult<IdpGroupDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisIdentityService.mapGroup(groupId, roleIds) };
  } catch (error) {
    return toActionError(error, "mapIdpGroupAction");
  }
}
