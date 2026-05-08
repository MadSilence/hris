import { timeOffPolicyMapper } from "@/api/modules/timeOffPolicies/mappers/";
import type { TimeOffPolicyDTO } from "@/api/modules/timeOffPolicies/dto";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyRenewalType,
  TimeOffPolicyStatus,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOffPolicies/dto";

describe("TimeOffPolicyMapper", () => {
  const dto: TimeOffPolicyDTO = {
    id: "policy-id",
    companyId: "company-id",

    name: "vacation",
    displayName: "Vacation",
    description: "Vacation policy",

    status: TimeOffPolicyStatus.Active,
    unit: TimeOffPolicyUnit.Days,

    paid: true,
    hiddenFromEmployees: false,

    yearlyQuota: 20,
    unlimitedQuota: false,

    renewalType: TimeOffPolicyRenewalType.YearlyFixedDate,
    renewalFixedDay: 1,
    renewalFixedMonth: 1,

    carryoverType: TimeOffPolicyCarryoverType.Limited,
    carryoverLimit: 5,

    carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.AfterPeriod,
    carryoverExpiryValue: 3,
    carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit.Months,

    archivedAt: null,
    archivedBy: null,

    createdAt: "2026-05-08T10:00:00",
    updatedAt: "2026-05-08T10:00:00",
    createdBy: "user-id",
    updatedBy: "user-id",

    version: 0,
  };

  it("maps time off policy dto to model", () => {
    const result = timeOffPolicyMapper.mapTimeOffPolicyDTO(dto);

    expect(result).toEqual({
      id: "policy-id",
      companyId: "company-id",

      name: "vacation",
      displayName: "Vacation",
      description: "Vacation policy",

      status: TimeOffPolicyStatus.Active,
      unit: TimeOffPolicyUnit.Days,

      paid: true,
      hiddenFromEmployees: false,

      yearlyQuota: 20,
      unlimitedQuota: false,

      renewalType: TimeOffPolicyRenewalType.YearlyFixedDate,
      renewalFixedDay: 1,
      renewalFixedMonth: 1,

      carryoverType: TimeOffPolicyCarryoverType.Limited,
      carryoverLimit: 5,

      carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.AfterPeriod,
      carryoverExpiryValue: 3,
      carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit.Months,

      archivedAt: null,
      archivedBy: null,

      createdAt: "2026-05-08T10:00:00",
      updatedAt: "2026-05-08T10:00:00",
      createdBy: "user-id",
      updatedBy: "user-id",

      version: 0,
    });
  });

  it("maps time off policy dto array to models", () => {
    const result = timeOffPolicyMapper.mapTimeOffPolicyDTOs([dto]);

    expect(result).toEqual([dto]);
  });
});
