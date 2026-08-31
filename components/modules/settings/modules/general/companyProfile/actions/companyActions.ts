"use server";

import { toActionError } from "@/lib/errors/withActionError";
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
    return toActionError(error, "companyActions");
  }
}

export async function updateCompanySettingsAction(
  body: UpdateCompanySettingsRequest,
): Promise<ActionResult<CompanySettings>> {
  try {
    const data = await hrisApiCompanyService.updateSettings(body);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "companyActions");
  }
}
