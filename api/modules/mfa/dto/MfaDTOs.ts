/** Two-step sign-in, as the signed-in person sees it — `GET /auth/mfa` (MFA_DESIGN.md § 5). */
export type TrustedDeviceDTO = {
  id: string;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
};

export type MfaStatusDTO = {
  enrolled: boolean;
  /** The company requires it of this person: it cannot be switched off. */
  required: boolean;
  backupCodesLeft: number;
  /** "Remember this device" is offered: the company allows it and the person is not a System Owner. */
  rememberAllowed: boolean;
  trustedDevices: TrustedDeviceDTO[];
};

export type EnrolmentStartDTO = { otpauthUri: string; secret: string };

export type BackupCodesDTO = { backupCodes: string[] };

export type MfaRequirement = "NOBODY" | "PRIVILEGED" | "EVERYONE";

/** Settings → Security (§ 4). */
export type SecuritySettingsDTO = {
  mfaRequired: MfaRequirement;
  mfaRememberDays: number;
  sessionIdleMinutes: number;
  /** How many people the PRIVILEGED level covers. */
  privilegedCount: number;
  /** Of those the current setting requires, how many have no factor yet. */
  requiredWithoutFactor: number;
};

export type SecuritySettingsUpdate = Partial<Pick<SecuritySettingsDTO, "mfaRequired" | "mfaRememberDays" | "sessionIdleMinutes">>;

export type StepUpRequest = { code?: string; backupCode?: string; password?: string };
