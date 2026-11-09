/** Settings → Login & SSO (ENTERPRISE_ACCESS_DESIGN.md § 4.5). */
export type IdentityConnectionDTO = {
  configured: boolean;
  provider: "OKTA" | "ENTRA" | "OTHER" | null;
  protocol: "OIDC" | "SAML";
  issuer: string | null;
  clientId: string | null;
  /** The secret itself never leaves the server. */
  clientSecretSet: boolean;
  samlMetadataUrl: string | null;
  samlIdpEntityId: string | null;
  samlIdpSsoUrl: string | null;
  samlCertificatesSet: boolean;
  ssoMode: "OFF" | "OPTIONAL" | "REQUIRED";
  ssoSessionHours: number;
  scimEnabled: boolean;
  /** The provider's own second factor stands in for ours. */
  trustIdpMfa: boolean;
  /** Only a System Owner may change which provider is trusted. */
  mayChangeProvider: boolean;
  redirectUri: string;
  samlAcsUrl: string;
  samlEntityId: string;
  scimBaseUrl: string;
  version: number | null;
};

export type IdentityConnectionUpdate = Partial<{
  provider: string;
  protocol: string;
  issuer: string;
  clientId: string;
  /** Leave out to keep the stored one; an empty string clears it. */
  clientSecret: string;
  samlMetadataUrl: string;
  samlIdpEntityId: string;
  samlIdpSsoUrl: string;
  samlIdpCertificates: string;
  ssoMode: string;
  ssoSessionHours: number;
  scimEnabled: boolean;
  trustIdpMfa: boolean;
  version: number | null;
}>;

export type ScimTokenDTO = {
  id: string;
  publicId: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  failureCount: number;
  revokedAt: string | null;
  revokedReason: string | null;
};

export type IssuedScimToken = { token: ScimTokenDTO; secret: string };

export type IdpGroupDTO = {
  id: string;
  displayName: string;
  memberCount: number;
  roles: { id: string; name: string; grantsAdministration: boolean }[];
};

export type TestResultDTO = { ok: boolean; message: string };
