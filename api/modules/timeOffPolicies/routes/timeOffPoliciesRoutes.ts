import { hrisTimeOffPoliciesService } from "@/api/modules/timeOffPolicies/services/";

export class TimeOffPoliciesRoutes {
  public async create(req: Request) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffPoliciesService.create({
      name: body.name,
      displayName: body.displayName,
      description: body.description ?? null,

      status: body.status,
      unit: body.unit,

      paid: body.paid,
      hiddenFromEmployees: body.hiddenFromEmployees,

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
    });

    return Response.json(data);
  }

  public async list(_req: Request) {
    const data = await hrisTimeOffPoliciesService.list();
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

  public async delete(_req: Request, id: string) {
    const data = await hrisTimeOffPoliciesService.delete(id);
    return Response.json(data);
  }
}

export const timeOffPoliciesRoutes = new TimeOffPoliciesRoutes();
