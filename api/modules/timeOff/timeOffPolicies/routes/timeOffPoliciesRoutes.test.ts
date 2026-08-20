class MockResponse {
  constructor(
    private body: unknown,
    public init?: ResponseInit
  ) {
  }

  async json() {
    return this.body;
  }

  static json(body: unknown, init?: ResponseInit) {
    return new MockResponse(body, init);
  }
}

Object.defineProperty(globalThis, "Response", {
  value: MockResponse,
  writable: true,
});

import { timeOffPoliciesRoutes } from "@/api/modules/timeOff/timeOffPolicies/routes/";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services/";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyRenewalType,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import {
  timeOffPolicyCreateRequest,
  timeOffPolicyDto,
  timeOffPolicyUpdateRequest,
} from "@/test/fixtures/timeOffPolicy";

jest.mock("@/api/modules/timeOff/timeOffPolicies/services/hrisTimeOffPoliciesService", () => ({
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

    const expected = timeOffPolicyCreateRequest();

    // What the wire actually sends: the optional fields are absent, not null. The route's job is to
    // normalise them, so the request must arrive with them undefined.
    const body = {
      ...expected,
      description: undefined,
      carryoverLimit: undefined,
      carryoverExpiryValue: undefined,
      carryoverExpiryUnit: undefined,
    };

    const req = {
      json: async () => body,
    } as Request;

    const res = await timeOffPoliciesRoutes.create(req);
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.create).toHaveBeenCalledWith(expected);

    expect(result).toEqual(response);
  });

  it("lists time off policies", async () => {
    const response = [timeOffPolicyDto()];

    jest.mocked(hrisTimeOffPoliciesService.list).mockResolvedValue(response);

    const res = await timeOffPoliciesRoutes.list({} as Request);
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.list).toHaveBeenCalledWith();
    expect(result).toEqual(response);
  });

  it("gets time off policy by id", async () => {
    const response = timeOffPolicyDto();

    jest.mocked(hrisTimeOffPoliciesService.getById).mockResolvedValue(response);

    const res = await timeOffPoliciesRoutes.getById({} as Request, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.getById).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(response);
  });

  it("updates time off policy", async () => {
    const response = { id: "policy-id", version: 1 };

    jest.mocked(hrisTimeOffPoliciesService.update).mockResolvedValue(response);

    const expected = timeOffPolicyUpdateRequest({
      displayName: "Vacation updated",
      unit: TimeOffPolicyUnit.Hours,
      hiddenFromEmployees: true,
      yearlyQuota: null,
      unlimitedQuota: true,
      renewalType: TimeOffPolicyRenewalType.Manual,
      renewalFixedDay: null,
      renewalFixedMonth: null,
      carryoverType: TimeOffPolicyCarryoverType.Unlimited,
      carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.AfterPeriod,
      carryoverExpiryValue: 10,
      carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit.Days,
    });

    // Optional fields arrive absent from the wire; the route is what turns them into nulls.
    const body = {
      ...expected,
      description: undefined,
      yearlyQuota: undefined,
      renewalFixedDay: undefined,
      renewalFixedMonth: undefined,
      carryoverLimit: undefined,
    };

    const req = {
      json: async () => body,
    } as Request;

    const res = await timeOffPoliciesRoutes.update(req, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.update).toHaveBeenCalledWith("policy-id", expected);

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
    // The service resolves void, so the route serialises an empty body.
    jest.mocked(hrisTimeOffPoliciesService.delete).mockResolvedValue(undefined);

    const res = await timeOffPoliciesRoutes.delete({} as Request, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPoliciesService.delete).toHaveBeenCalledWith("policy-id");
    expect(result).toBeUndefined();
  });
});