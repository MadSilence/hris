import { partialMock } from "@/test/types";
﻿class MockResponse {
  public status: number;

  constructor(
    private body: unknown,
    public init?: ResponseInit
  ) {
    this.status = init?.status ?? 200;
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

import { timeOffPolicyAssignmentsRoutes } from "@/api/modules/timeOff/timeOffPolicyAssignments/routes";
import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";
import { TimeOffPolicyAssignmentStatus } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";

jest.mock("@/api/modules/timeOff/timeOffPolicyAssignments/services", () => ({
  hrisTimeOffPolicyAssignmentsService: {
    listByPolicyId: jest.fn(),
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
      .mockResolvedValue(partialMock([assignment]));

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
});