"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiCompanyService } from "@/api/modules/company/services";
import type { Company } from "@/models/company/Company";
import type { CompanySettings } from "@/models/company/CompanySettings";
import type {
  UpdateCompanyRequest,
  UpdateCompanySettingsRequest,
} from "@/api/modules/company/dto/CompanyDTO";

type ActionResult<T> = {
  status: ActionStatus;
  data?: T;
  errorMessage?: string;
};

export async function updateCompanyAction(
  body: UpdateCompanyRequest,
): Promise<ActionResult<Company>> {
  try {
    const data = await hrisApiCompanyService.updateCompany(body);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("Failed to update company:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to update company profile." };
  }
}

export async function updateCompanySettingsAction(
  body: UpdateCompanySettingsRequest,
): Promise<ActionResult<CompanySettings>> {
  try {
    const data = await hrisApiCompanyService.updateSettings(body);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("Failed to update company settings:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to update company settings." };
  }
}
