import { useAppDataContext } from "@/components/providers/AppDataProvider/AppDataProvider";
import { useMemo } from "react";
import { AuthService } from "@/components/modules/auth/services/AuthService/AuthService";

export const useAuthService = () => {
  const { internalApiClient } = useAppDataContext();

  return useMemo(() => new AuthService(internalApiClient), [internalApiClient]);
};
