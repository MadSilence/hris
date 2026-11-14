import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import { applyAccent } from "@/lib/theme/accent";
import { companyAppearanceService } from "@/components/modules/settings/modules/general/companyAppearance/services/companyAppearanceService";
import { updateCompanyAppearanceAction } from "@/components/modules/settings/modules/general/companyAppearance/actions/companyAppearanceActions";
import {
  deleteCompanyLogoAction,
  uploadCompanyLogoAction,
} from "@/components/modules/settings/modules/general/companyAppearance/actions/companyLogoActions";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";
import type { ActionResult } from "@/lib/errors/withActionError";

export const COMPANY_APPEARANCE_QUERY_KEY = ["company", "appearance"] as const;

/** A refused save or upload, with the backend's code, so the page can tell a conflict or a refused file apart. */
export class AppearanceActionError extends Error {
  readonly code?: string;
  readonly requestId?: string;

  constructor(result: Pick<ActionResult, "errorMessage" | "code" | "requestId">) {
    super(result.errorMessage ?? "");
    this.name = "AppearanceActionError";
    this.code = result.code;
    this.requestId = result.requestId;
  }
}

/** Someone else saved first (E00409): the version the page held is stale. */
export const isConflict = (error: unknown): boolean => error instanceof AppearanceActionError && error.code === "E00409";

/** A file the backend will not take as a logo — its kind, size or bytes (CL00001–CL00005), not a failure of ours. */
export const isRefusedFile = (error: unknown): boolean =>
  error instanceof AppearanceActionError && /^CL0000[1-5]$/.test(error.code ?? "");

export const useCompanyAppearance = () =>
  useQuery({
    queryKey: COMPANY_APPEARANCE_QUERY_KEY,
    queryFn: () => companyAppearanceService.get(),
  });

const useInvalidateCompanyAppearance = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: COMPANY_APPEARANCE_QUERY_KEY });
};

/**
 * Saves the colour and the background. The accent is put on `<html>` by the root layout on the server, so the saved
 * colour has to be pushed into the live document: `applyAccent` sets it on that element directly instead of
 * `router.refresh()`, which would refetch the entire route tree to change one attribute.
 */
export const useUpdateCompanyAppearance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateCompanyAppearanceRequest): Promise<CompanyAppearance | undefined> => {
      const result = await updateCompanyAppearanceAction(body);
      if (result.status === ActionStatus.ERROR) throw new AppearanceActionError(result);
      return result.data;
    },
    onSuccess: (data) => {
      if (!data) {
        void queryClient.invalidateQueries({ queryKey: COMPANY_APPEARANCE_QUERY_KEY });
        return;
      }
      queryClient.setQueryData(COMPANY_APPEARANCE_QUERY_KEY, data);
      applyAccent(document.documentElement, data.accent);
    },
  });
};

/**
 * The company logo, uploaded or removed at once (no Save). The company is re-read so the sidebar shows the new logo,
 * and the appearance too: the server took the logo's colours on upload.
 */
export const useUploadCompanyLogo = () => {
  const { refreshCompany } = useCompanyData();
  const invalidate = useInvalidateCompanyAppearance();

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.set("file", file);
      const result = await uploadCompanyLogoAction(form);
      if (result.status === ActionStatus.ERROR) throw new AppearanceActionError(result);
    },
    onSuccess: async () => {
      await Promise.all([refreshCompany(), invalidate()]);
    },
  });
};

export const useDeleteCompanyLogo = () => {
  const { refreshCompany } = useCompanyData();
  const invalidate = useInvalidateCompanyAppearance();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteCompanyLogoAction();
      if (result.status === ActionStatus.ERROR) throw new AppearanceActionError(result);
    },
    onSuccess: async () => {
      await Promise.all([refreshCompany(), invalidate()]);
    },
  });
};
