/** Who an email confirmation link is for and which address it confirms. Reading it does not use it. */
export type EmailChangePeekResponse = {
  firstName: string | null;
  newEmail: string;
};

/** The confirmed address is the login from now on. */
export type EmailChangeConfirmResponse = {
  email: string;
  subdomain: string | null;
};
