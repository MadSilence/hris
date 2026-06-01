import { timeOffPoliciesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/services/timeOffPoliciesService";

describe("TimeOffPoliciesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("lists time off policies", async () => {
    const response = [{ id: "policy-id" }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await timeOffPoliciesService.list();

    expect(global.fetch).toHaveBeenCalledWith("/api/time-off/policies", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    expect(result).toEqual(response);
  });

  it("throws error when list fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(timeOffPoliciesService.list()).rejects.toThrow(
      "Failed to load time off policies"
    );
  });

  it("gets time off policy by id", async () => {
    const response = { id: "policy-id" };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await timeOffPoliciesService.getById("policy-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id",
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    expect(result).toEqual(response);
  });

  it("throws error when getById fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(
      timeOffPoliciesService.getById("policy-id")
    ).rejects.toThrow("Failed to load time off policy");
  });
});
