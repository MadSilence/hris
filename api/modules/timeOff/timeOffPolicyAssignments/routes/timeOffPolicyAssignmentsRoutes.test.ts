class MockResponse {
  public status: number;

  constructor(
    private body: unknown,
    public init?: any
  ) {
    this.status = init?.status ?? 200;
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

import { timeOffPolicyAssignmentsRoutes } from "@/api/modules/timeOff/timeOffPolicyAssignments/routes";
import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";
import { TimeOffPolicyAssignmentStatus } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";

jest.mock("@/api/modules/timeOff/timeOffPolicyAssignments/services", () => ({
  hrisTimeOffPolicyAssignmentsService: {
    listByPolicyId: jest.fn(),
    create: jest.fn(),
    end: jest.fn(),
  },
}));

describe("TimeOffPolicyAssignmentsRoutes", () => {
  const assignment = {
    id: "assignment-id",
    policyId: "policy-id",
    userId: "user-id",
    status: TimeOffPolicyAssignmentStatus.Active,
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    endedAt: null,
    endedBy: null,
    createdAt: "2026-01-01T10:00:00",
    updatedAt: "2026-01-01T10:00:00",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists assignments by policy id", async () => {
    jest
      .mocked(hrisTimeOffPolicyAssignmentsService.listByPolicyId)
      .mockResolvedValue([assignment] as any);

    const res = await timeOffPolicyAssignmentsRoutes.listByPolicyId(
      {} as Request,
      "policy-id"
    );
    const result = await res.json();

    expect(
      hrisTimeOffPolicyAssignmentsService.listByPolicyId
    ).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual([assignment]);
  });

  it("creates assignment", async () => {
    const response = { id: "assignment-id" };

    jest
      .mocked(hrisTimeOffPolicyAssignmentsService.create)
      .mockResolvedValue(response);

    const body = {
      userId: "user-id",
      effectiveFrom: "2026-01-01",
      effectiveTo: undefined,
    };

    const req = { json: async () => body } as Request;

    const res = await timeOffPolicyAssignmentsRoutes.create(req, "policy-id");
    const result = await res.json();

    expect(hrisTimeOffPolicyAssignmentsService.create).toHaveBeenCalledWith(
      "policy-id",
      { ...body, effectiveTo: null }
    );
    expect(result).toEqual(response);
  });

  it("ends assignment", async () => {
    const response = { id: "assignment-id" };

    jest
      .mocked(hrisTimeOffPolicyAssignmentsService.end)
      .mockResolvedValue(response);

    const req = {
      json: async () => ({ effectiveTo: "2026-06-30" }),
    } as Request;

    const res = await timeOffPolicyAssignmentsRoutes.end(
      req,
      "assignment-id"
    );
    const result = await res.json();

    expect(hrisTimeOffPolicyAssignmentsService.end).toHaveBeenCalledWith(
      "assignment-id",
      { effectiveTo: "2026-06-30" }
    );
    expect(result).toEqual(response);
  });
});