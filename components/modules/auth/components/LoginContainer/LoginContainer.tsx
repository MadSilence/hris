"use client";

import * as React from "react";
import { useLoginAction } from "@/components/modules/auth/hooks/useLoginAction";
import LoginForm, { LoginFormValues } from "@/components/modules/auth/components/LoginForm/LoginForm";
import { messageForError } from "@/lib/errors/errorMessages";
import { APP_HOME } from "@/lib/companyAddress";

export const PASSWORD_CHANGED_NOTICE = "Your password was changed. Sign in with the new one.";

type LoginContainerProps = {
  /** Set when the person arrives here straight after changing their password, which signed them out. */
  passwordChanged?: boolean;
  headline?: string;
  subheadline?: string;
  changeCompanyHref?: string;
  /** Where signing in goes — a path on this host the server has already checked. */
  returnTo?: string;
};

const LoginContainer: React.FC<LoginContainerProps> = ({
  passwordChanged = false,
  headline,
  subheadline,
  changeCompanyHref,
  returnTo = APP_HOME,
}) => {
  const loginAction = useLoginAction();

  const handleSubmit = React.useCallback(
    async (values: LoginFormValues) => {
      const res = await loginAction.mutateAsync(values);

      if (res.ok) {
        // A full navigation, not router.push, on purpose.
        //
        // The root layout is what reads the session cookie and paints the company's brand
        // (BrandThemeStyle). A client-side push keeps the layout that rendered for the *logged-out*
        // login page — no cookie, no brand — so the app came up in the shipped brown and only
        // corrected itself whenever something later forced a hard load. Signing in changes identity;
        // re-rendering everything from the server is the honest response, and it costs one load.
        window.location.assign(returnTo);
        return;
      }

      // The client throws for every failing status, so reaching here means a 2xx that was not a
      // sign-in. There is no code to look up and nothing specific to say.
      throw new Error(`Login answered ${res.status} without a session`);
    },
    [loginAction, returnTo],
  );

  return (
    <LoginForm
      onSubmitAction={handleSubmit}
      isLoading={loginAction.isPending}
      /*
        The dictionary, not the exception's own text. This read `error.message` directly, which is
        the backend's English on a good day \u2014 and on a bad one is a sentence written for whoever has
        to debug it: the login screen showed "Cannot reach the API at http://localhost:8081 \u2014 is the
        backend running?" to anybody who tried to sign in while the API was down. The refusal for a
        wrong password (`AUTH00001`) went the same way, in the server's wording rather than ours.
      */
      apiError={loginAction.error ? messageForError(loginAction.error) : undefined}
      notice={passwordChanged ? PASSWORD_CHANGED_NOTICE : undefined}
      headline={headline}
      subheadline={subheadline}
      changeCompanyHref={changeCompanyHref}
    />
  );
};

export default LoginContainer;
