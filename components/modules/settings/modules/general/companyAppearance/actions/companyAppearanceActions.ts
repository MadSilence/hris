"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisCompanyAppearanceService } from "@/api/modules/company/modules/appearance/services";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";

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
    console.error("Failed to update company appearance:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to save appearance settings." };
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
    console.error("Failed to upload login image:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to upload the login image." };
  }
}

export async function deleteLoginImageAction(): Promise<ActionResult<CompanyAppearance>> {
  try {
    const data = await hrisCompanyAppearanceService.deleteLoginImage();
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("Failed to remove login image:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to remove the login image." };
  }
}
