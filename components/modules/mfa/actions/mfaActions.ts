"use server";

// Every export is an explicit `async function` — a `const` does not survive as a server action.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisMfaService } from "@/api/modules/mfa/services";
import type {
  BackupCodesDTO,
  EnrolmentStartDTO,
  SecuritySettingsDTO,
  SecuritySettingsUpdate,
  StepUpRequest,
} from "@/api/modules/mfa/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export async function startMfaEnrolmentAction(password: string): Promise<ActionResult<EnrolmentStartDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisMfaService.startEnrolment(password) };
  } catch (error) {
    return toActionError(error, "startMfaEnrolmentAction");
  }
}

export async function confirmMfaEnrolmentAction(code: string, signOutOthers: boolean): Promise<ActionResult<BackupCodesDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisMfaService.confirmEnrolment(code, signOutOthers) };
  } catch (error) {
    return toActionError(error, "confirmMfaEnrolmentAction");
  }
}

export async function regenerateBackupCodesAction(): Promise<ActionResult<BackupCodesDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisMfaService.regenerateBackupCodes() };
  } catch (error) {
    return toActionError(error, "regenerateBackupCodesAction");
  }
}

export async function disableMfaAction(code?: string, backupCode?: string): Promise<ActionResult<void>> {
  try {
    await hrisMfaService.disable(code, backupCode);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "disableMfaAction");
  }
}

export async function forgetTrustedDeviceAction(id: string): Promise<ActionResult<void>> {
  try {
    await hrisMfaService.forgetDevice(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "forgetTrustedDeviceAction");
  }
}

export async function forgetAllTrustedDevicesAction(): Promise<ActionResult<void>> {
  try {
    await hrisMfaService.forgetAllDevices();
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "forgetAllTrustedDevicesAction");
  }
}

export async function stepUpAction(body: StepUpRequest): Promise<ActionResult<void>> {
  try {
    await hrisMfaService.stepUp(body);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "stepUpAction");
  }
}

export async function resetUserMfaAction(userId: string, verifiedOutOfBand: boolean): Promise<ActionResult<void>> {
  try {
    await hrisMfaService.resetUser(userId, verifiedOutOfBand);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "resetUserMfaAction");
  }
}

export async function updateSecuritySettingsAction(body: SecuritySettingsUpdate): Promise<ActionResult<SecuritySettingsDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisMfaService.updateSecuritySettings(body) };
  } catch (error) {
    return toActionError(error, "updateSecuritySettingsAction");
  }
}
