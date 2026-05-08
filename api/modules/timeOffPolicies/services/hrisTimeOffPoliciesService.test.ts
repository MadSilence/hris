import { hrisApiTimeOffPoliciesClient } from "@/api/modules/timeOffPolicies/clients/";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOffPolicies/services/";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyRenewalType,
  TimeOffPolicyStatus,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOffPolicies/dto";

jest.mock("@/api/modules/timeOffPolicies/clients/", () => ({
  hrisApiTimeOffPoliciesClient: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    rename: jest.fn(),
    activate: jest.fn(),
    archive: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("HrisTimeOffPoliciesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates create to client", async () => {
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

    jest.mocked(hrisApiTimeOffPoliciesClient.create).mockResolvedValue(response);

    const result = await hrisTimeOffPoliciesService.create(request);

    expect(hrisApiTimeOffPoliciesClient.create).toHaveBeenCalledWith(request);
    expect(result).toEqual(response);
  });

  it("delegates list to client", async () => {
    const response: any[] = [];

    jest.mocked(hrisApiTimeOffPoliciesClient.list).mockResolvedValue(response);

    const result = await hrisTimeOffPoliciesService.list();

    expect(hrisApiTimeOffPoliciesClient.list).toHaveBeenCalledWith();
    expect(result).toEqual(response);
  });

  it("delegates getById to client", async () => {
    const response = { id: "policy-id" } as any;

    jest.mocked(hrisApiTimeOffPoliciesClient.getById).mockResolvedValue(response);

    const result = await hrisTimeOffPoliciesService.getById("policy-id");

    expect(hrisApiTimeOffPoliciesClient.getById).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(response);
  });

  it("delegates update to client", async () => {
    const response = { id: "policy-id", version: 1 };

    const request = {
      displayName: "Vacation",
      description: null,

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

    jest.mocked(hrisApiTimeOffPoliciesClient.update).mockResolvedValue(response);

    const result = await hrisTimeOffPoliciesService.update("policy-id", request);

    expect(hrisApiTimeOffPoliciesClient.update).toHaveBeenCalledWith(
      "policy-id",
      request
    );
    expect(result).toEqual(response);
  });

  it("delegates rename to client", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiTimeOffPoliciesClient.rename).mockResolvedValue(response);

    const result = await hrisTimeOffPoliciesService.rename("policy-id", {
      name: "new-name",
    });

    expect(hrisApiTimeOffPoliciesClient.rename).toHaveBeenCalledWith(
      "policy-id",
      { name: "new-name" }
    );
    expect(result).toEqual(response);
  });

  it("delegates activate to client", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiTimeOffPoliciesClient.activate).mockResolvedValue(response);

    const result = await hrisTimeOffPoliciesService.activate("policy-id");

    expect(hrisApiTimeOffPoliciesClient.activate).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(response);
  });

  it("delegates archive to client", async () => {
    1
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiTimeOffPoliciesClient.archive).mockResolvedValue(response);

    const result = await hrisTimeOffPoliciesService.archive("policy-id");

    expect(hrisApiTimeOffPoliciesClient.archive).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(response);
  });

  it("delegates delete to client", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisApiTimeOffPoliciesClient.delete).mockResolvedValue(response);

    const result = await hrisTimeOffPoliciesService.delete("policy-id");

    expect(hrisApiTimeOffPoliciesClient.delete).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(response);
  });
});
