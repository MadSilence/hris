"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisCompanyLogoService } from "@/api/modules/company/modules/companyLogo/services/hrisCompanyLogoService";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * The company logo: the backend, permissions, audit and this BFF service existed for months with no
 * control in front of them, so the logo could be shown everywhere and set nowhere.
 */
export async function uploadCompanyLogoAction(formData: FormData): Promise<ActionResult<void>> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: ActionStatus.ERROR, errorMessage: "Please choose an image file." };
  }
  try {
    await hrisCompanyLogoService.uploadLogo(file);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "uploadCompanyLogoAction");
  }
}

export async function deleteCompanyLogoAction(): Promise<ActionResult<void>> {
  try {
    await hrisCompanyLogoService.deleteLogo();
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "deleteCompanyLogoAction");
  }
}
