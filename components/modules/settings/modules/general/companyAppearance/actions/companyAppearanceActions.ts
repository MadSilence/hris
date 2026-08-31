"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisCompanyAppearanceService } from "@/api/modules/company/modules/appearance/services";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";
import { toActionError } from "@/lib/errors/withActionError";

type ActionResult<T> = {
  status: ActionStatus;
  data?: T;
  errorMessage?: string;
};

export async function updateCompanyAppearanceAction(
  body: UpdateCompanyAppearanceRequest,
): Promise<ActionResult<CompanyAppearance>> {
  try {
    const data = await hrisCompanyAppearanceService.updateAppearance(body);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "companyAppearanceActions");
  }
}

export async function uploadLoginImageAction(
  formData: FormData,
): Promise<ActionResult<CompanyAppearance>> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { status: ActionStatus.ERROR, errorMessage: "Please choose an image file." };
  }

  try {
    const data = await hrisCompanyAppearanceService.uploadLoginImage(file);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "companyAppearanceActions");
  }
}

export async function deleteLoginImageAction(): Promise<ActionResult<CompanyAppearance>> {
  try {
    const data = await hrisCompanyAppearanceService.deleteLoginImage();
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "companyAppearanceActions");
  }
}
