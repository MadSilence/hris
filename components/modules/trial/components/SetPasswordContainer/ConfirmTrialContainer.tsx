"use client";

import { FC, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import ConfirmTrialForm, { PasswordValues, } from "@/components/modules/trial/components/SetPasswordForm/ConfirmTrialForm";
import { useConfirmTrialAction } from "@/components/modules/trial/hooks/useConfirmTrialAction";

const ConfirmTrialContainer: FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const setPassword = useConfirmTrialAction();

  const handleSubmit = useCallback(
    async (values: PasswordValues) => {
      const result = await setPassword.mutateAsync({
        token,
        password: values.password,
      });

      if (result) {
        setIsSuccess(true);
      }
    },
    [setPassword, token],
  );

  return (
    <ConfirmTrialForm
      onSubmitAction={handleSubmit}
      isLoading={setPassword.isPending}
      apiError={
        setPassword.error instanceof Error ? setPassword.error.message : undefined
      }
      isSuccess={isSuccess}
    />
  );
};

export default ConfirmTrialContainer;
