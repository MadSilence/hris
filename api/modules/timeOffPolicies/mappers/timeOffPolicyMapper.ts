import type { TimeOffPolicyDTO } from "@/api/modules/timeOffPolicies/dto";
import { TimeOffPolicy } from "@/models/timeOff";

export class TimeOffPolicyMapper {
  public mapTimeOffPolicyDTO(dto: TimeOffPolicyDTO): TimeOffPolicy {
    return {
      id: dto.id,
      companyId: dto.companyId,

      name: dto.name,
      displayName: dto.displayName,
      description: dto.description,

      status: dto.status,
      unit: dto.unit,

      paid: dto.paid,
      hiddenFromEmployees: dto.hiddenFromEmployees,

      yearlyQuota: dto.yearlyQuota,
      unlimitedQuota: dto.unlimitedQuota,

      renewalType: dto.renewalType,
      renewalFixedDay: dto.renewalFixedDay,
      renewalFixedMonth: dto.renewalFixedMonth,

      carryoverType: dto.carryoverType,
      carryoverLimit: dto.carryoverLimit,

      carryoverExpiryType: dto.carryoverExpiryType,
      carryoverExpiryValue: dto.carryoverExpiryValue,
      carryoverExpiryUnit: dto.carryoverExpiryUnit,

      archivedAt: dto.archivedAt,
      archivedBy: dto.archivedBy,

      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      createdBy: dto.createdBy,
      updatedBy: dto.updatedBy,

      version: dto.version,
    };
  }

  public mapTimeOffPolicyDTOs(dtos: TimeOffPolicyDTO[]): TimeOffPolicy[] {
    return dtos.map((dto) => this.mapTimeOffPolicyDTO(dto));
  }
}

export const timeOffPolicyMapper = new TimeOffPolicyMapper();
