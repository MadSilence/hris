"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisCompanyLogoService } from "@/api/modules/company/modules/companyLogo/services/hrisCompanyLogoService";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * The company logo, uploaded and removed on Appearance (sign-in-appearance; it moved there from Company, Q-23).
 * The backend takes its colours on upload. Earlier the backend, permissions, audit and this BFF service existed with no
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
