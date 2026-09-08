import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services/";

export class TimeOffPoliciesRoutes {
  public async create(req: Request) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffPoliciesService.create({
      leaveTypeId: body.leaveTypeId,
      name: body.name,
      displayName: body.displayName,
      description: body.description ?? null,

      status: body.status,
      unit: body.unit,

      paid: body.paid,
      hiddenFromEmployees: body.hiddenFromEmployees,

      effectiveDate: body.effectiveDate ?? null,

      countingMode: body.countingMode,
      includePublicHolidays: body.includePublicHolidays,

      entitlementGrantingMode: body.entitlementGrantingMode,
      allowRequestsInAdvanceOfAccrual: body.allowRequestsInAdvanceOfAccrual,

      yearlyQuota: body.yearlyQuota ?? null,
      unlimitedQuota: body.unlimitedQuota,

      renewalType: body.renewalType,
      renewalFixedDay: body.renewalFixedDay ?? null,
      renewalFixedMonth: body.renewalFixedMonth ?? null,

      carryoverType: body.carryoverType,
      carryoverLimit: body.carryoverLimit ?? null,

      carryoverExpiryType: body.carryoverExpiryType,
      carryoverExpiryValue: body.carryoverExpiryValue ?? null,
      carryoverExpiryUnit: body.carryoverExpiryUnit ?? null,

      allowNegativeCarryover: body.allowNegativeCarryover,
      negativeCarryoverLimit: body.negativeCarryoverLimit ?? null,

      allowNegativeBalance: body.allowNegativeBalance,
      maxNegativeBalance: body.maxNegativeBalance ?? null,
      negativeBalanceCappedByQuota: body.negativeBalanceCappedByQuota,
    });

    return Response.json(data);
  }

  public async list(_req: Request) {
    const data = await hrisTimeOffPoliciesService.list();
    return Response.json(data);
  }

  public async exportPolicies(req: Request) {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
    const backendResponse = await hrisTimeOffPoliciesService.exportPolicies(format);
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition":
          backendResponse.headers.get("content-disposition") ?? "attachment",
      },
    });
  }

  public async editImpact(_req: Request, id: string) {
    const data = await hrisTimeOffPoliciesService.editImpact(id);
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisTimeOffPoliciesService.getById(id);
    return Response.json(data);
  }

  public async update(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffPoliciesService.update(id, {
      displayName: body.displayName,
      description: body.description ?? null,

      unit: body.unit,

      paid: body.paid,
      hiddenFromEmployees: body.hiddenFromEmployees,

      effectiveDate: body.effectiveDate ?? null,

      countingMode: body.countingMode,
      includePublicHolidays: body.includePublicHolidays,

      entitlementGrantingMode: body.entitlementGrantingMode,
      allowRequestsInAdvanceOfAccrual: body.allowRequestsInAdvanceOfAccrual,

      yearlyQuota: body.yearlyQuota ?? null,
      unlimitedQuota: body.unlimitedQuota,

      renewalType: body.renewalType,
      renewalFixedDay: body.renewalFixedDay ?? null,
      renewalFixedMonth: body.renewalFixedMonth ?? null,

      carryoverType: body.carryoverType,
      carryoverLimit: body.carryoverLimit ?? null,

      carryoverExpiryType: body.carryoverExpiryType,
      carryoverExpiryValue: body.carryoverExpiryValue ?? null,
      carryoverExpiryUnit: body.carryoverExpiryUnit ?? null,

      allowNegativeCarryover: body.allowNegativeCarryover,
      negativeCarryoverLimit: body.negativeCarryoverLimit ?? null,

      allowNegativeBalance: body.allowNegativeBalance,
      maxNegativeBalance: body.maxNegativeBalance ?? null,
      negativeBalanceCappedByQuota: body.negativeBalanceCappedByQuota,
    });

    return Response.json(data);
  }

  public async rename(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffPoliciesService.rename(id, {
      name: body.name,
    });

    return Response.json(data);
  }

  public async activate(_req: Request, id: string) {
    const data = await hrisTimeOffPoliciesService.activate(id);
    return Response.json(data);
  }

  public async archive(_req: Request, id: string) {
    const data = await hrisTimeOffPoliciesService.archive(id);
    return Response.json(data);
  }

  public async unarchive(_req: Request, id: string) {
    const data = await hrisTimeOffPoliciesService.unarchive(id);
    return Response.json(data);
  }

  public async delete(_req: Request, id: string) {
    const data = await hrisTimeOffPoliciesService.delete(id);
    return Response.json(data);
  }
}

export const timeOffPoliciesRoutes = new TimeOffPoliciesRoutes();