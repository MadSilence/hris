import { useMemo } from "react";
import { useAppDataContext } from "@/components/providers/AppDataProvider/AppDataProvider";
import { TrialService } from "../../services/TrialService/TrialService";

export const useTrialService = () => {
    const { internalApiClient } = useAppDataContext();
    return useMemo(() => new TrialService(internalApiClient), [internalApiClient]);
};
