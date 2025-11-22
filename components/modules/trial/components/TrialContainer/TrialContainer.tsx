"use client";

import TrialForm, { TrialValues } from "../TrialForm/TrialForm";
import { useStartTrialAction } from "../../hooks/useStartTrialAction";
import { useState } from "react";

const StartTrialContainer: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const startTrial = useStartTrialAction();

  const handleSubmit = async (values: TrialValues) => {
    try {
      const result = await startTrial.mutateAsync(values);

      if (result) {
        setIsSuccess(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <TrialForm
      submitting={startTrial.isPending}
      apiError={startTrial.error instanceof Error ? startTrial.error.message : undefined}
      onSubmit={handleSubmit}
      isSuccess={isSuccess}
    />
  );
};

export default StartTrialContainer;
