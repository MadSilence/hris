import { internalApiClient } from "@/components/clients/apiClient";
import { timeOffPoliciesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/services/timeOffPoliciesService";

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { get: jest.fn() },
}));

const mockGet = internalApiClient.get as jest.Mock;

describe("TimeOffPoliciesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists time off policies", async () => {
    const response = [{ id: "policy-id" }];
    mockGet.mockResolvedValue(response);

    const result = await timeOffPoliciesService.list();

    expect(mockGet).toHaveBeenCalledWith("/time-off/policies");
    expect(result).toEqual(response);
  });

  it("gets time off policy by id", async () => {
    const response = { id: "policy-id" };
    mockGet.mockResolvedValue(response);

    const result = await timeOffPoliciesService.getById("policy-id");

    expect(mockGet).toHaveBeenCalledWith("/time-off/policies/policy-id");
    expect(result).toEqual(response);
  });

  it("propagates errors from the api client", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(timeOffPoliciesService.list()).rejects.toThrow("boom");
  });
});
