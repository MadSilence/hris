"use client";

import * as React from "react";
import { useLoginAction } from "@/components/modules/auth/hooks/useLoginAction";
import LoginForm, { LoginFormValues } from "@/components/modules/auth/components/LoginForm/LoginForm";

const LoginContainer: React.FC = () => {
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
        window.location.assign("/dashboard");
        return;
      }

      throw new Error(res.status.toString());
    },
    [loginAction],
  );

  return (
    <LoginForm
      onSubmitAction={handleSubmit}
      isLoading={loginAction.isPending}
      apiError={
        loginAction.error instanceof Error ? loginAction.error.message : undefined
      }
    />
  );
};

export default LoginContainer;
