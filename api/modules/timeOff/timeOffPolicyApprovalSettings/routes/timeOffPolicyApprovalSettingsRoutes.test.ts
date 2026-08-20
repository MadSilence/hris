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
      update: jest.fn(),
    },
  })
);

describe("TimeOffPolicyApprovalSettingsRoutes", () => {
  const updateResponse = { id: "policy-id" };

  const settings = {
    policyId: "policy-id",
    allApprovalsRequired: true,
    approvalOrderStrict: false,
    allowSubstituteApprovers: false,
    approvers: [
      {
        id: "approver-id",
        approverType: TimeOffPolicyApproverType.SpecificUser,
        approverUserId: "user-id",
        approvalOrder: 1,
        required: true,
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

  it("updates approval settings", async () => {
    jest
      // update resolves an UpdateResponse, not the settings — the old mock returned the wrong shape.
      .mocked(hrisTimeOffPolicyApprovalSettingsService.update)
      .mockResolvedValue(updateResponse);

    const body = {
      allApprovalsRequired: true,
      approvalOrderStrict: false,
      allowSubstituteApprovers: false,
      approvers: [
        {
          approverType: TimeOffPolicyApproverType.SpecificUser,
          approverUserId: "user-id",
          approvalOrder: 1,
          required: true,
        },
      ],
    };

    const req = { json: async () => body } as Request;

    const res = await timeOffPolicyApprovalSettingsRoutes.update(
      req,
      "policy-id"
    );
    const result = await res.json();

    expect(
      hrisTimeOffPolicyApprovalSettingsService.update
    ).toHaveBeenCalledWith("policy-id", body);
    expect(result).toEqual(updateResponse);
  });
});