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

import { timeOffPolicyApprovalSettingsRoutes } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/routes";
import { hrisTimeOffPolicyApprovalSettingsService } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/services";
import { TimeOffPolicyApproverType } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";

jest.mock(
  "@/api/modules/timeOff/timeOffPolicyApprovalSettings/services",
  () => ({
    hrisTimeOffPolicyApprovalSettingsService: {
      getByPolicyId: jest.fn(),
    },
  })
);

describe("TimeOffPolicyApprovalSettingsRoutes", () => {
  const settings = {
    policyId: "policy-id",
    configured: true,
    approvalRequired: true,
    approvalMode: "ALL" as const,
    requiredApprovalsCount: null,
    allowSubstituteApprovers: false,
    approvers: [
      {
        id: "approver-id",
        approverType: TimeOffPolicyApproverType.SpecificUser,
        approverUserId: "user-id",
        approvalOrder: 1,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets approval settings by policy id", async () => {
    jest
      .mocked(hrisTimeOffPolicyApprovalSettingsService.getByPolicyId)
      .mockResolvedValue(partialMock(settings));

    const res = await timeOffPolicyApprovalSettingsRoutes.getByPolicyId(
      {} as Request,
      "policy-id"
    );
    const result = await res.json();

    expect(
      hrisTimeOffPolicyApprovalSettingsService.getByPolicyId
    ).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(settings);
  });
});