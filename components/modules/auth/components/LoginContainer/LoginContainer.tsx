"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLoginAction } from "@/components/modules/auth/hooks/useLoginAction";
import LoginForm, { LoginFormValues } from "@/components/modules/auth/components/LoginForm/LoginForm";

const LoginContainer: React.FC = () => {
  const loginAction = useLoginAction();
  const router = useRouter();

  const handleSubmit = React.useCallback(
    async (values: LoginFormValues) => {
      const res = await loginAction.mutateAsync(values);

      if (res.ok) {
        router.push("/organization/people");
        return;
      }

      throw new Error(res.status.toString());
    },
    [loginAction, router],
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
