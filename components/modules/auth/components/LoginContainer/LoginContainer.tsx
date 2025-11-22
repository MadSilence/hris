"use client";

import * as React from "react";
import LoginForm from "@/components/modules/auth/components/LoginForm/LoginForm";
import { useLoginAction } from "@/components/modules/auth/hooks/useLoginAction";
import {router} from "next/client";
import {useRouter} from "next/navigation";

const LoginContainer: React.FC = () => {
  const loginAction = useLoginAction();
    const router = useRouter();

  return (
    <LoginForm
      onSubmit={async (values) => {
        const res = await loginAction.mutateAsync(values);
          console.log(res);
            if (res.ok) {
                router.push("/organization/people");
            } else {
                throw new Error(res.status.toString());
            }
      }}
      submitting={loginAction.isPending}
      apiError={loginAction.error instanceof Error ? loginAction.error.message : undefined}
    />
  );
};

export default LoginContainer;
