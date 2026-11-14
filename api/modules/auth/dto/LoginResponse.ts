/** `POST /auth/login` and the second step: an access token, or what the second step is (MFA_DESIGN.md § 5). */
export type LoginResponse = {
    accessToken?: string;
    /** `LINKED`: a Connect finished — the account is linked and no new session was opened. */
    mfa?: "CHALLENGE" | "ENROL" | "LINKED";
    challengeToken?: string;
    backupCodes?: string[];
    backupCodesLeft?: number;
    /** After a provider's round trip: what it was for, so the BFF knows where the browser goes next. */
    purpose?: "SIGN_IN" | "CONNECT" | "INVITE" | "SIGNUP" | "REAUTH" | "DOMAIN_CONNECT";
    /** After a provider's round trip: the page of this app it started from, if it named one. */
    returnTo?: string;
    /** After a registration's round trip: B3's draft, moved into a cookie by the BFF. */
    signupDraft?: string;
};
