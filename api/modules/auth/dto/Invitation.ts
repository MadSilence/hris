/** OPEN, or why the link does not open (sign-in-invitation G5). */
export type InviteState = "OPEN" | "USED" | "WITHDRAWN" | "EXPIRED" | "BROKEN";

/** Who an invitation link is for — enough to greet them, nothing more. */
export type InvitePeekResponse = {
  state: InviteState;
  /** The company's own provider when its SSO is required and the person keeps no password (G4). */
  ssoProvider: string | null;
  firstName: string | null;
  email: string | null;
  companyName: string | null;
};

export type AcceptInviteRequest = {
  token: string;
  password: string;
};
