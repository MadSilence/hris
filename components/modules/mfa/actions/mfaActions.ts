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
import { cookies } from "next/headers";
import { EMAIL_CODE_COOKIE } from "@/config/security/sessionCookieNames";

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

/** "Set up again" after a backup code (sign-in-second-step D3): the old phone keeps working until the new one's code. */
export async function startMfaReplacementAction(): Promise<ActionResult<EnrolmentStartDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisMfaService.startReplacement() };
  } catch (error) {
    return toActionError(error, "startMfaReplacementAction");
  }
}

export async function confirmMfaReplacementAction(code: string): Promise<ActionResult<BackupCodesDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisMfaService.confirmReplacement(code) };
  } catch (error) {
    return toActionError(error, "confirmMfaReplacementAction");
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

/**
 * Resets somebody's two-step login (AQ-06, U3). `proof` is the admin's own — the password (no factor), a code or a
 * backup code (a factor), or the code emailed to them (signs in by code; bound to this browser's `__Host-code`) — and
 * is the step-up. Without it, a fresh step-up is asked for.
 */
export async function resetUserMfaAction(
  userId: string,
  verifiedOutOfBand: boolean,
  proof?: { password?: string; code?: string; backupCode?: string; emailCode?: string },
): Promise<ActionResult<void>> {
  try {
    const store = proof?.emailCode ? await cookies() : null;
    const browserToken = store?.get(EMAIL_CODE_COOKIE)?.value;
    await hrisMfaService.resetUser(userId, verifiedOutOfBand, proof && { ...proof, ...(browserToken ? { browserToken } : {}) });
    if (store) store.delete(EMAIL_CODE_COOKIE);
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
