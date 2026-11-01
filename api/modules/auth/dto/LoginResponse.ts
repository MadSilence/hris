/** `POST /auth/login` and the second step: an access token, or what the second step is (MFA_DESIGN.md § 5). */
export type LoginResponse = {
    accessToken?: string;
    /** `LINKED`: a Connect finished — the account is linked and no new session was opened. */
    mfa?: "CHALLENGE" | "ENROL" | "LINKED";
    challengeToken?: string;
    backupCodes?: string[];
    backupCodesLeft?: number;
};
