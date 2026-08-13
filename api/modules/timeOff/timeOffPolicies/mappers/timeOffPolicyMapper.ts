import type { TimeOffPolicyDTO } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { TimeOffPolicy } from "@/models/timeOff";

export class TimeOffPolicyMapper {
  public mapTimeOffPolicyDTO(dto: TimeOffPolicyDTO): TimeOffPolicy {
    return {
      id: dto.id,
      companyId: dto.companyId,
      leaveTypeId: dto.leaveTypeId,

      name: dto.name,
      displayName: dto.displayName,
      description: dto.description,

      status: dto.status,
      unit: dto.unit,

      paid: dto.paid,
      hiddenFromEmployees: dto.hiddenFromEmployees,

      effectiveDate: dto.effectiveDate,

      countingMode: dto.countingMode,
      validWeekdays: dto.validWeekdays,
      includePublicHolidays: dto.includePublicHolidays,

      entitlementGrantingMode: dto.entitlementGrantingMode,
      allowRequestsInAdvanceOfAccrual: dto.allowRequestsInAdvanceOfAccrual,

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

      allowNegativeCarryover: dto.allowNegativeCarryover,
      negativeCarryoverLimit: dto.negativeCarryoverLimit,

      allowNegativeBalance: dto.allowNegativeBalance,
      maxNegativeBalance: dto.maxNegativeBalance,
      negativeBalanceCappedByQuota: dto.negativeBalanceCappedByQuota,

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