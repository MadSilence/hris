"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { MfaStatusDTO, SecuritySettingsDTO } from "@/api/modules/mfa/dto";

export const MFA_STATUS_QK = ["MFA_STATUS"] as const;
export const SECURITY_SETTINGS_QK = ["SECURITY_SETTINGS"] as const;

/** The reader's own two-step sign-in. */
export const useMfaStatus = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<MfaStatusDTO>({
    queryKey: MFA_STATUS_QK,
    queryFn: () => internalApiClient.get<MfaStatusDTO>("/auth/mfa"),
    enabled,
  });
};

export const useInvalidateMfaStatus = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: MFA_STATUS_QK });
};

/** Settings → Security. */
export const useSecuritySettings = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<SecuritySettingsDTO>({
    queryKey: SECURITY_SETTINGS_QK,
    queryFn: () => internalApiClient.get<SecuritySettingsDTO>("/company/security-settings"),
  });
};
