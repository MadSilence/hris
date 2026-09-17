"use client";

import { FC, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import ConfirmTrialForm, {
  PasswordValues,
  SignInAddress,
} from "@/components/modules/trial/components/SetPasswordForm/ConfirmTrialForm";
import { useConfirmTrialAction } from "@/components/modules/trial/hooks/useConfirmTrialAction";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { companyHost, companyOrigin } from "@/lib/companyAddress";

const ConfirmTrialContainer: FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { envConfig } = useAppDataContext();

  const [signInAddress, setSignInAddress] = useState<SignInAddress | null>(null);
  const setPassword = useConfirmTrialAction();

  const handleSubmit = useCallback(
    async (values: PasswordValues) => {
      const result = await setPassword.mutateAsync({
        token,
        password: values.password,
      });

      // The address comes back from the backend rather than from what was typed at signup: a race with
      // another registration of the same name can suffix it.
      if (result?.subdomain) {
        setSignInAddress({
          href: `${companyOrigin(result.subdomain, envConfig.web)}/login`,
          label: companyHost(result.subdomain, envConfig.web),
        });
      }
    },
    [setPassword, token, envConfig.web],
  );

  return (
    <ConfirmTrialForm
      onSubmitAction={handleSubmit}
      isLoading={setPassword.isPending}
      apiError={
        setPassword.error instanceof Error ? setPassword.error.message : undefined
      }
      isSuccess={signInAddress !== null}
      signInAddress={signInAddress ?? undefined}
    />
  );
};

export default ConfirmTrialContainer;
