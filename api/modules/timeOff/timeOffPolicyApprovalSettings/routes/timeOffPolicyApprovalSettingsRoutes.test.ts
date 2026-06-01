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
      .mockResolvedValue(settings as any);

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
      .mocked(hrisTimeOffPolicyApprovalSettingsService.update)
      .mockResolvedValue(settings as any);

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
    expect(result).toEqual(settings);
  });
});