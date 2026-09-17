/** Who an invitation link is for — enough to greet them, nothing more. */
export type InvitePeekResponse = {
  firstName: string | null;
  email: string | null;
  companyName: string | null;
};

export type AcceptInviteRequest = {
  token: string;
  password: string;
};
