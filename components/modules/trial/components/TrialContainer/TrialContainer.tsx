"use client";

import { FC, useCallback, useState } from "react";
import { useStartTrialAction } from "../../hooks/useStartTrialAction";
import TrialForm, { TrialValues } from "@/components/modules/trial/components/TrialForm/TrialForm";

const StartTrialContainer: FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const startTrial = useStartTrialAction();

  const handleSubmit = useCallback(
    async (values: TrialValues) => {
      const result = await startTrial.mutateAsync(values);

      if (result) {
        setIsSuccess(true);
      }
    },
    [startTrial],
  );

  return (
    <TrialForm
      isLoading={startTrial.isPending}
      apiError={
        startTrial.error instanceof Error ? startTrial.error.message : undefined
      }
      isSuccess={isSuccess}
      onSubmitAction={handleSubmit}
    />
  );
};

export default StartTrialContainer;
