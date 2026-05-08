class MockResponse {
  constructor(
    private body: unknown,
    public init?: any
  ) {
  }

  async json() {
    return this.body;
  }

  static json(body: unknown, init?: any) {
    return new MockResponse(body, init);
  }
}

Object.defineProperty(globalThis, "Response", {
  value: MockResponse,
  writable: true,
});

import { timeOffPoliciesRoutes } from "@/api/modules/timeOffPolicies/routes/";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOffPolicies/services/";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyRenewalType,
  TimeOffPolicyStatus,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOffPolicies/dto";

jest.mock("@/api/modules/timeOffPolicies/services/hrisTimeOffPoliciesService", () => ({
  hrisTimeOffPoliciesService: {
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

describe("TimeOffPoliciesRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates time off policy", async () => {
    const response = { id: "policy-id" };

    jest.mocked(hrisTimeOffPoliciesService.create).mockResolvedValue(response);

    const body = {
      name: "vacation",
      displayName: "Vacation",
      description: undefined,

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
      carryoverLimit: undefined,

      carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.Never,
      carryoverExpiryValue: undefined,
      carryoverExpiryUnit: undefined,
    };

    const req = {
      json: async () => body,
    } as Request;

    const res = await timeOffPoliciesRoutes.create(req);
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.create).toHaveBeenCalledWith({
      ...body,
      description: null,
      carryoverLimit: null,
      carryoverExpiryValue: null,
      carryoverExpiryUnit: null,
    });

    expect(result).toEqual(response);
  });

  it("lists time off policies", async () => {
    const response: any[] = [];

    jest.mocked(hrisTimeOffPoliciesService.list).mockResolvedValue(response);

    const res = await timeOffPoliciesRoutes.list({} as Request);
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.list).toHaveBeenCalledWith();
    expect(result).toEqual(response);
  });

  it("gets time off policy by id", async () => {
    const response = { id: "policy-id" } as any;

    jest.mocked(hrisTimeOffPoliciesService.getById).mockResolvedValue(response);

    const res = await timeOffPoliciesRoutes.getById({} as Request, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.getById).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(response);
  });

  it("updates time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisTimeOffPoliciesService.update).mockResolvedValue(response);

    const body = {
      displayName: "Vacation updated",
      description: undefined,

      unit: TimeOffPolicyUnit.Hours,

      paid: true,
      hiddenFromEmployees: true,

      yearlyQuota: undefined,
      unlimitedQuota: true,

      renewalType: TimeOffPolicyRenewalType.Manual,
      renewalFixedDay: undefined,
      renewalFixedMonth: undefined,

      carryoverType: TimeOffPolicyCarryoverType.Unlimited,
      carryoverLimit: undefined,

      carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.AfterPeriod,
      carryoverExpiryValue: 10,
      carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit.Days,
    };

    const req = {
      json: async () => body,
    } as Request;

    const res = await timeOffPoliciesRoutes.update(req, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.update).toHaveBeenCalledWith("policy-id", {
      ...body,
      description: null,
      yearlyQuota: null,
      renewalFixedDay: null,
      renewalFixedMonth: null,
      carryoverLimit: null,
    });

    expect(result).toEqual(response);
  });

  it("renames time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisTimeOffPoliciesService.rename).mockResolvedValue(response);

    const req = {
      json: async () => ({ name: "new-name" }),
    } as Request;

    const res = await timeOffPoliciesRoutes.rename(req, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.rename).toHaveBeenCalledWith(
      "policy-id",
      { name: "new-name" }
    );
    expect(result).toEqual(response);
  });

  it("activates time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisTimeOffPoliciesService.activate).mockResolvedValue(response);

    const res = await timeOffPoliciesRoutes.activate({} as Request, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.activate).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(response);
  });

  it("archives time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisTimeOffPoliciesService.archive).mockResolvedValue(response);

    const res = await timeOffPoliciesRoutes.archive({} as Request, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.archive).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(response);
  });

  it("deletes time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisTimeOffPoliciesService.delete).mockResolvedValue(response);

    const res = await timeOffPoliciesRoutes.delete({} as Request, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.delete).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(response);
  });
});
