"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisCompanyAppearanceService } from "@/api/modules/company/modules/appearance/services";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/** Appearance's Save: the colour and the background, version-checked. */
export async function updateCompanyAppearanceAction(
  body: UpdateCompanyAppearanceRequest,
): Promise<ActionResult<CompanyAppearance>> {
  try {
    const data = await hrisCompanyAppearanceService.updateAppearance(body);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "updateCompanyAppearanceAction");
  }
}
