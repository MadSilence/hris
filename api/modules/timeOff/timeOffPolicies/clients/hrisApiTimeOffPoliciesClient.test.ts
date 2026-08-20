import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiTimeOffPoliciesClient } from "@/api/modules/timeOff/timeOffPolicies/clients/";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import {
  timeOffPolicyCreateRequest,
  timeOffPolicyDto,
  timeOffPolicyUpdateRequest,
} from "@/test/fixtures/timeOffPolicy";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe("HrisApiTimeOffPoliciesClient", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates time off policy", async () => {
    const response = { id: "policy-id" };
    const request = timeOffPolicyCreateRequest();

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.create(request);

    expect(hrisApiClient.post).toHaveBeenCalledWith("/time-off/policies/create", request);
    expect(result).toEqual(response);
  });

  it("gets time off policy by id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue(dto);

    const result = await hrisApiTimeOffPoliciesClient.getById("policy-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith("/time-off/policies/policy-id");
    expect(result).toEqual(dto);
  });

  it("updates time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    const request = timeOffPolicyUpdateRequest({
      displayName: "Vacation updated",
      yearlyQuota: 25,
      carryoverType: TimeOffPolicyCarryoverType.Limited,
      carryoverLimit: 5,
      carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.AfterPeriod,
      carryoverExpiryValue: 3,
      carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit.Months,
    });

    jest.mocked(hrisApiClient.patch).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.update("policy-id", request);

    expect(hrisApiClient.patch).toHaveBeenCalledWith("/time-off/policies/policy-id", request);
    expect(result).toEqual(response);
  });

  it("activates time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.activate("policy-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith("/time-off/policies/policy-id/activate");
    expect(result).toEqual(response);
  });

  it("archives time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.archive("policy-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith("/time-off/policies/policy-id/archive");
    expect(result).toEqual(response);
  });

  it("deletes time off policy", async () => {
    jest.mocked(hrisApiClient.post).mockResolvedValue(undefined);

    const result = await hrisApiTimeOffPoliciesClient.delete("policy-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith("/time-off/policies/policy-id/delete");
    expect(result).toBeUndefined();
  });
});
