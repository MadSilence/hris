import { useTrialService } from "@/components/modules/trial/hooks/useTrialService";
import { useMutation } from "@tanstack/react-query";
import { ConfirmTrialPayload } from "@/components/modules/trial/services/TrialService";

export const useConfirmTrialAction = () => {
  const service = useTrialService();
  return useMutation<Response, Error, ConfirmTrialPayload>({
    mutationFn: (payload) => service.confirmTrial(payload),
  });
};
