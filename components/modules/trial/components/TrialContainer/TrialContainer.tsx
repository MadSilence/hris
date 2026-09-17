"use client";

import { FC, useCallback, useState } from "react";
import { useStartTrialAction } from "../../hooks/useStartTrialAction";
import TrialForm, { TrialValues } from "@/components/modules/trial/components/TrialForm/TrialForm";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { companyHost } from "@/lib/companyAddress";

const StartTrialContainer: FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const startTrial = useStartTrialAction();
  const { envConfig } = useAppDataContext();

  const handleSubmit = useCallback(
    async (values: TrialValues) => {
      const result = await startTrial.mutateAsync(values);

      if (result) {
        setIsSuccess(true);
      }
    },
    [startTrial],
  );

  const companyAddressPreview = useCallback(
    (subdomain: string) => companyHost(subdomain, envConfig.web),
    [envConfig.web],
  );

  return (
    <TrialForm
      isLoading={startTrial.isPending}
      apiError={
        startTrial.error instanceof Error ? startTrial.error.message : undefined
      }
      isSuccess={isSuccess}
      onSubmitAction={handleSubmit}
      companyAddressPreview={companyAddressPreview}
    />
  );
};

export default StartTrialContainer;
