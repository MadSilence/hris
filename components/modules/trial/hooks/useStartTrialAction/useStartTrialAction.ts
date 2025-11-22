import { useMutation } from "@tanstack/react-query";
import { useTrialService } from "../useTrialService";
import type { StartTrialPayload } from "../../services/TrialService/TrialService";

export const useStartTrialAction = () => {
  const service = useTrialService();
  return useMutation<Response, Error, StartTrialPayload>({
    mutationFn: (payload) => service.startTrial(payload),
  });
};
