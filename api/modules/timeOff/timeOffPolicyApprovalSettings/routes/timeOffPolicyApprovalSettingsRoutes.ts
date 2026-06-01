import { hrisTimeOffPolicyApprovalSettingsService } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/services";

export class TimeOffPolicyApprovalSettingsRoutes {
  public async getByPolicyId(_req: Request, policyId: string) {
    const data =
      await hrisTimeOffPolicyApprovalSettingsService.getByPolicyId(policyId);
    return Response.json(data);
  }

  public async update(req: Request, policyId: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffPolicyApprovalSettingsService.update(
      policyId,
      {
        allApprovalsRequired: body.allApprovalsRequired,
        approvalOrderStrict: body.approvalOrderStrict,
        allowSubstituteApprovers: body.allowSubstituteApprovers,
        approvers: body.approvers,
      }
    );

    return Response.json(data);
  }
}

export const timeOffPolicyApprovalSettingsRoutes =
  new TimeOffPolicyApprovalSettingsRoutes();