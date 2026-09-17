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
};

/** Setting a new password with the link. Uses the link, once; every existing session ends. */
export type ResetPasswordRequest = {
  token: string;
  password: string;
};

/** The signed-in change. Ends every session of the person, the one making the change included. */
export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
