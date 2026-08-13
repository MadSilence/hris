import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import { companySettingsService } from "@/components/modules/settings/modules/general/companyProfile/services/companySettingsService";
import {
  updateCompanyAction,
  updateCompanySettingsAction,
} from "@/components/modules/settings/modules/general/companyProfile/actions/companyActions";
import type { UpdateCompanyRequest, UpdateCompanySettingsRequest } from "@/api/modules/company/dto/CompanyDTO";

const COMPANY_SETTINGS_KEY = ["company", "settings"] as const;

export const useCompanySettings = () =>
  useQuery({
    queryKey: COMPANY_SETTINGS_KEY,
    queryFn: () => companySettingsService.get(),
  });

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateCompanySettingsRequest) => {
      const result = await updateCompanySettingsAction(body);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update company settings");
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMPANY_SETTINGS_KEY });
    },
  });
};

/** Company profile update. Caller refreshes the SWR company provider on success. */
export const useUpdateCompany = () =>
  useMutation({
    mutationFn: async (body: UpdateCompanyRequest) => {
      const result = await updateCompanyAction(body);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update company profile");
      }
      return result.data;
    },
  });
