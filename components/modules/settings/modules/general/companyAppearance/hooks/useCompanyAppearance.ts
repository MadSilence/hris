import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ActionStatus } from "@/components/models/ActionStatus";
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
 * Shared success path for every appearance mutation. Besides refreshing the query, it calls
 * `router.refresh()` — the palette lives in a `<style>` rendered by the root *server* layout, so
 * without re-running the server render the saved colour would only appear on a full reload.
 */
const useAppearanceMutationSuccess = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return (data: CompanyAppearance | undefined) => {
    if (data) {
      queryClient.setQueryData(COMPANY_APPEARANCE_QUERY_KEY, data);
    }

    void queryClient.invalidateQueries({ queryKey: COMPANY_APPEARANCE_QUERY_KEY });
    router.refresh();
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
