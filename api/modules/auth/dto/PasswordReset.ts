/** Asking for a reset link. The backend answers 204 whether or not the address has an account. */
export type ForgotPasswordRequest = {
  email: string;
  /** The company the page was opened at, read from the host on the server. */
  subdomain: string;
};

/** "Don't know your company address?" The backend answers 204 whether the email holds none, one or many. */
export type CompanyAddressReminderRequest = {
  email: string;
};

/** Who a reset link is for — enough to greet them, nothing more. */
export type PasswordResetPeekResponse = {
  firstName: string | null;
  /** The address the link is for (F3). */
  email: string | null;
  /** The person's own Google / Microsoft accounts this reset disconnects (F4). */
  connectedProviders?: Array<"GOOGLE" | "MICROSOFT">;
  /** The account is locked and has a second factor: the page asks for a code too (M5). */
  codeRequired?: boolean;
};

/** Setting a new password with the link. Uses the link, once; every existing session ends. */
export type ResetPasswordRequest = {
  token: string;
  password: string;
  /** A second-factor or backup code, when the link's account is locked and has a factor. */
  code?: string;
};

/** The signed-in change. Ends every session of the person, the one making the change included. */
export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
