import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import { createTimeOffPolicyAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/createTimeOffPolicyAction/createTimeOffPolicyAction";
import { TimeOffPolicyStatus, TimeOffPolicyUnit, TimeOffPolicyRenewalType, TimeOffPolicyCarryoverType, TimeOffPolicyCarryoverExpiryType } from "@/api/modules/timeOff/timeOffPolicies/dto";

jest.mock("@/api/modules/timeOff/timeOffPolicies/services", () => ({
  hrisTimeOffPoliciesService: { create: jest.fn() },
}));

describe("createTimeOffPolicyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = {
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

  it("creates time off policy", async () => {
    const response = { id: "policy-id" };
    jest.mocked(hrisTimeOffPoliciesService.create).mockResolvedValue(response);

    const result = await createTimeOffPolicyAction(submission);

    expect(hrisTimeOffPoliciesService.create).toHaveBeenCalledWith(submission);
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when create fails", async () => {
    jest.mocked(hrisTimeOffPoliciesService.create).mockRejectedValue(new Error("Failed"));

    const result = await createTimeOffPolicyAction(submission);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while creating the time off policy. Please try again.",
    });
  });
});
