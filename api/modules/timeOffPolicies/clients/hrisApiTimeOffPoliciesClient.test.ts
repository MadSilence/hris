import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiTimeOffPoliciesClient } from "@/api/modules/timeOffPolicies/clients/";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyRenewalType,
  TimeOffPolicyStatus,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOffPolicies/dto";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe("HrisApiTimeOffPoliciesClient", () => {
  const dto = {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates time off policy", async () => {
    const response = { id: "policy-id" };

    const request = {
      name: "vacation",
      displayName: "Vacation",
      description: null,

      status: TimeOffPolicyStatus.Draft,
      unit: TimeOffPolicyUnit.Days,

      paid: true,
      hiddenFromEmployees: false,

      yearlyQuota: 20,
      unlimitedQuota: false,

      renewalType: TimeOffPolicyRenewalType.YearlyFixedDate,
      renewalFixedDay: 1,
      renewalFixedMonth: 1,

      carryoverType: TimeOffPolicyCarryoverType.None,
      carryoverLimit: null,

      carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.Never,
      carryoverExpiryValue: null,
      carryoverExpiryUnit: null,
    };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.create(request);

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/policies",
      request
    );
    expect(result).toEqual(response);
  });

  it("lists time off policies", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([dto]);

    const result = await hrisApiTimeOffPoliciesClient.list();

    expect(hrisApiClient.get).toHaveBeenCalledWith("/api/time-off/policies");
    expect(result).toEqual([dto]);
  });

  it("gets time off policy by id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue(dto);

    const result = await hrisApiTimeOffPoliciesClient.getById("policy-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id"
    );
    expect(result).toEqual(dto);
  });

  it("updates time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    const request = {
      displayName: "Vacation updated",
      description: null,

      unit: TimeOffPolicyUnit.Days,

      paid: true,
      hiddenFromEmployees: false,

      yearlyQuota: 25,
      unlimitedQuota: false,

      renewalType: TimeOffPolicyRenewalType.YearlyFixedDate,
      renewalFixedDay: 1,
      renewalFixedMonth: 1,

      carryoverType: TimeOffPolicyCarryoverType.Limited,
      carryoverLimit: 5,

      carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.AfterPeriod,
      carryoverExpiryValue: 3,
      carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit.Months,
    };

    jest.mocked(hrisApiClient.patch).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.update("policy-id", request);

    expect(hrisApiClient.patch).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id",
      request
    );
    expect(result).toEqual(response);
  });

  it("renames time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.rename("policy-id", {
      name: "new-name",
    });

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id/rename",
      { name: "new-name" }
    );
    expect(result).toEqual(response);
  });

  it("activates time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.activate("policy-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id/activate"
    );
    expect(result).toEqual(response);
  });

  it("archives time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.archive("policy-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id/archive"
    );
    expect(result).toEqual(response);
  });

  it("deletes time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffPoliciesClient.delete("policy-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id/delete"
    );
    expect(result).toEqual(response);
  });
});
