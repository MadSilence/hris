import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  BackupCodesDTO,
  EnrolmentStartDTO,
  MfaStatusDTO,
  SecuritySettingsDTO,
  SecuritySettingsUpdate,
  StepUpRequest,
} from "@/api/modules/mfa/dto";

/** `/auth/mfa`, `/auth/step-up`, `/users/{id}/mfa/reset` and `/company/security-settings`. */
export class HrisApiMfaClient {
  public async status(): Promise<MfaStatusDTO> {
    return hrisApiClient.get<MfaStatusDTO>("/auth/mfa");
  }

  public async startEnrolment(password: string): Promise<EnrolmentStartDTO> {
    return hrisApiClient.post<EnrolmentStartDTO>("/auth/mfa/enrolment/start", { password });
  }

  public async confirmEnrolment(code: string, signOutOthers: boolean): Promise<BackupCodesDTO> {
    return hrisApiClient.post<BackupCodesDTO>("/auth/mfa/enrolment/confirm", { code, signOutOthers });
  }

  public async regenerateBackupCodes(): Promise<BackupCodesDTO> {
    return hrisApiClient.post<BackupCodesDTO>("/auth/mfa/backup-codes/regenerate");
  }

  public async disable(code?: string, backupCode?: string): Promise<void> {
    await hrisApiClient.post<void>("/auth/mfa/disable", { code, backupCode });
  }

  public async forgetDevice(id: string): Promise<void> {
    await hrisApiClient.delete<void>(`/auth/mfa/trusted-devices/${id}`);
  }

  public async forgetAllDevices(): Promise<void> {
    await hrisApiClient.post<void>("/auth/mfa/trusted-devices/delete-all");
  }

  public async stepUp(body: StepUpRequest): Promise<void> {
    await hrisApiClient.post<void>("/auth/step-up", { ...body });
  }

  public async resetUser(userId: string, verifiedOutOfBand: boolean): Promise<void> {
    await hrisApiClient.post<void>(`/users/${userId}/mfa/reset`, { verifiedOutOfBand });
  }

  public async securitySettings(): Promise<SecuritySettingsDTO> {
    return hrisApiClient.get<SecuritySettingsDTO>("/company/security-settings");
  }

  public async updateSecuritySettings(body: SecuritySettingsUpdate): Promise<SecuritySettingsDTO> {
    return hrisApiClient.patch<SecuritySettingsDTO>("/company/security-settings", body);
  }
}

export const hrisApiMfaClient = new HrisApiMfaClient();
