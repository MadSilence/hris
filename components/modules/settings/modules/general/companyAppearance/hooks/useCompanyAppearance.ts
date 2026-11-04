import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import { applyAccent } from "@/lib/theme/accent";
import { companyAppearanceService } from "@/components/modules/settings/modules/general/companyAppearance/services/companyAppearanceService";
import {
  deleteLoginImageAction,
  updateCompanyAppearanceAction,
  uploadLoginImageAction,
} from "@/components/modules/settings/modules/general/companyAppearance/actions/companyAppearanceActions";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";

export const COMPANY_APPEARANCE_QUERY_KEY = ["company", "appearance"] as const;

export const useCompanyAppearance = () =>
  useQuery({
    queryKey: COMPANY_APPEARANCE_QUERY_KEY,
    queryFn: () => companyAppearanceService.get(),
  });

/**
 * Shared success path for every appearance mutation.
 *
 * The accent is put on `<html>` by the root layout on the server, so the saved colour has to be pushed into
 * the live document somehow. `applyAccent` sets it on that element directly instead of `router.refresh()`,
 * which would refetch the entire route tree to change one attribute.
 */
const useAppearanceMutationSuccess = () => {
  const queryClient = useQueryClient();

  return (data: CompanyAppearance | undefined) => {
    if (!data) {
      void queryClient.invalidateQueries({ queryKey: COMPANY_APPEARANCE_QUERY_KEY });
      return;
    }

    queryClient.setQueryData(COMPANY_APPEARANCE_QUERY_KEY, data);
    applyAccent(document.documentElement, data.accent);
  };
};

export const useUpdateCompanyAppearance = () => {
  const onSuccess = useAppearanceMutationSuccess();

  return useMutation({
    mutationFn: async (body: UpdateCompanyAppearanceRequest) => {
      const result = await updateCompanyAppearanceAction(body);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to save appearance settings");
      }

      return result.data;
    },
    onSuccess,
  });
};

export const useUploadLoginImage = () => {
  const onSuccess = useAppearanceMutationSuccess();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadLoginImageAction(formData);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to upload the login image");
      }

      return result.data;
    },
    onSuccess,
  });
};

export const useDeleteLoginImage = () => {
  const onSuccess = useAppearanceMutationSuccess();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteLoginImageAction();

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to remove the login image");
      }

      return result.data;
    },
    onSuccess,
  });
};
