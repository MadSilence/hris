import { employeeTimeOffBalancesService } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services/employeeTimeOffBalancesService";

describe("EmployeeTimeOffBalancesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("gets balance by id", async () => {
    const response = { id: "balance-id" };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await employeeTimeOffBalancesService.getById("balance-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/time-off/balances/balance-id",
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    expect(result).toEqual(response);
  });

  it("throws error when getById fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(
      employeeTimeOffBalancesService.getById("balance-id")
    ).rejects.toThrow("Failed to load employee time off balance");
  });

  it("lists balances by user id", async () => {
    const response = [{ id: "balance-id" }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result =
      await employeeTimeOffBalancesService.listByUserId("user-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/users/user-id/time-off-balances",
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    expect(result).toEqual(response);
  });

  it("throws error when listByUserId fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(
      employeeTimeOffBalancesService.listByUserId("user-id")
    ).rejects.toThrow("Failed to load employee time off balances");
  });

  it("lists adjustments by balance id", async () => {
    const response = [{ id: "adjustment-id" }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result =
      await employeeTimeOffBalancesService.listAdjustments("balance-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/time-off/balances/balance-id/adjustments",
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    expect(result).toEqual(response);
  });

  it("throws error when listAdjustments fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(
      employeeTimeOffBalancesService.listAdjustments("balance-id")
    ).rejects.toThrow("Failed to load employee time off balance adjustments");
  });
});
