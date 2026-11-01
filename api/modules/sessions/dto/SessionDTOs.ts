/** One of a person's sessions — `GET /auth/sessions` (R1.1). */
export type SessionDTO = {
  id: string;
  authMethod: "PASSWORD" | "OIDC" | "SAML";
  createdAt: string;
  lastSeenAt: string;
  userAgent: string | null;
  ip: string | null;
  /** The session this browser is in. */
  isCurrent: boolean;
};

export type SessionsEndedDTO = { ended: number };
