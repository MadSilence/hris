"use client";

import { useState } from "react";
import ConfirmTrialForm, { PasswordValues } from "@/components/modules/trial/components/SetPasswordForm/ConfirmTrialForm";
import { useConfirmTrialAction } from "@/components/modules/trial/hooks/useConfirmTrialAction";
import { useSearchParams } from "next/navigation";


const ConfirmTrialContainer: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isSuccess, setIsSuccess] = useState(false);
  const setPassword = useConfirmTrialAction();

  const handleSubmit = async (values: PasswordValues) => {
    try {
      const result = await setPassword.mutateAsync({token, password: values.password});
      if (result) setIsSuccess(true);
    } catch (e) {
      setIsSuccess(false);
    }
  };

  return (
    <ConfirmTrialForm
      onSubmit={handleSubmit}
      submitting={setPassword.isPending}
      apiError={
        setPassword.error instanceof Error
          ? setPassword.error.message
          : undefined
      }
      isSuccess={isSuccess}
    />
  );
};

export default ConfirmTrialContainer;
