import { useTrialService } from "@/components/modules/trial/hooks/useTrialService";
import { useMutation } from "@tanstack/react-query";
import { ConfirmTrialPayload, ConfirmTrialResult } from "@/components/modules/trial/services/TrialService";

export const useConfirmTrialAction = () => {
  const service = useTrialService();
  return useMutation<ConfirmTrialResult, Error, ConfirmTrialPayload>({
    mutationFn: (payload) => service.confirmTrial(payload),
  });
};
