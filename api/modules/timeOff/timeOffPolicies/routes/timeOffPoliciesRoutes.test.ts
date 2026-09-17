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
import { timeOffPolicyDto } from "@/test/fixtures/timeOffPolicy";

jest.mock("@/api/modules/timeOff/timeOffPolicies/services/hrisTimeOffPoliciesService", () => ({
  hrisTimeOffPoliciesService: {
    list: jest.fn(),
    getById: jest.fn(),
  },
}));

describe("TimeOffPoliciesRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});