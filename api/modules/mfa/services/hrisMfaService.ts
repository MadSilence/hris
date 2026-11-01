import { hrisApiMfaClient } from "@/api/modules/mfa/clients";
import type { SecuritySettingsUpdate, StepUpRequest } from "@/api/modules/mfa/dto";

export class HrisMfaService {
  public status() {
    return hrisApiMfaClient.status();
  }

  public startEnrolment(password: string) {
    return hrisApiMfaClient.startEnrolment(password);
  }

  public confirmEnrolment(code: string, signOutOthers: boolean) {
    return hrisApiMfaClient.confirmEnrolment(code, signOutOthers);
  }

  public regenerateBackupCodes() {
    return hrisApiMfaClient.regenerateBackupCodes();
  }

  public disable(code?: string, backupCode?: string) {
    return hrisApiMfaClient.disable(code, backupCode);
  }

  public forgetDevice(id: string) {
    return hrisApiMfaClient.forgetDevice(id);
  }

  public forgetAllDevices() {
    return hrisApiMfaClient.forgetAllDevices();
  }

  public stepUp(body: StepUpRequest) {
    return hrisApiMfaClient.stepUp(body);
  }

  public resetUser(userId: string, verifiedOutOfBand: boolean) {
    return hrisApiMfaClient.resetUser(userId, verifiedOutOfBand);
  }

  public securitySettings() {
    return hrisApiMfaClient.securitySettings();
  }

  public updateSecuritySettings(body: SecuritySettingsUpdate) {
    return hrisApiMfaClient.updateSecuritySettings(body);
  }
}

export const hrisMfaService = new HrisMfaService();
