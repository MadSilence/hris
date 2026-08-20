import { timeOffPolicyMapper } from "@/api/modules/timeOff/timeOffPolicies/mappers/";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import { timeOffPolicyDto } from "@/test/fixtures/timeOffPolicy";

describe("TimeOffPolicyMapper", () => {
  // Carryover is spelled out because the mapper copies it through the same as everything else, and a
  // fixture full of nulls would not notice a field being dropped.
  const dto = timeOffPolicyDto({
    description: "Vacation policy",
    carryoverType: TimeOffPolicyCarryoverType.Limited,
    carryoverLimit: 5,
    carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.AfterPeriod,
    carryoverExpiryValue: 3,
    carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit.Months,
    createdBy: "user-id",
    updatedBy: "user-id",
  });

  it("maps time off policy dto to model", () => {
    const result = timeOffPolicyMapper.mapTimeOffPolicyDTO(dto);

    // The mapper is a field-for-field copy, so asserting against the dto itself is both the real
    // contract and the only form that survives the DTO gaining a field.
    expect(result).toEqual(dto);
  });

  it("maps time off policy dto array to models", () => {
    const result = timeOffPolicyMapper.mapTimeOffPolicyDTOs([dto]);

    expect(result).toEqual([dto]);
  });
});
