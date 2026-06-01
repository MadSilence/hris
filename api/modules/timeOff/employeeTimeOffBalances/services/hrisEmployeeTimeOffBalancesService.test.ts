import { hrisApiEmployeeTimeOffBalancesClient } from "@/api/modules/timeOff/employeeTimeOffBalances/clients";
import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";

jest.mock("@/api/modules/timeOff/employeeTimeOffBalances/clients", () => ({
  hrisApiEmployeeTimeOffBalancesClient: {
    create: jest.fn(),
    getById: jest.fn(),
    listByUserId: jest.fn(),
    adjust: jest.fn(),
    listAdjustments: jest.fn(),
  },
}));

describe("HrisEmployeeTimeOffBalancesService", () => {
  const balance = {
    id: "balance-id",
    assignmentId: "assignment-id",
    policyId: "policy-id",
    userId: "user-id",
    year: 2026,
    openingBalance: 20,
    accruedBalance: 0,
    usedBalance: 5,
    adjustedBalance: -2,
    carriedOverBalance: 3,
    currentBalance: 16,
    createdAt: "2026-01-01T10:00:00",
    updatedAt: "2026-06-01T10:00:00",
  };

  const adjustment = {
    id: "adjustment-id",
    balanceId: "balance-id",
    adjustmentAmount: -2,
    reason: "Correction for unauthorized absence",
    createdAt: "2026-06-01T10:00:00",
    createdBy: "admin-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates create to client", async () => {
    const response = { id: "balance-id" };

    jest
      .mocked(hrisApiEmployeeTimeOffBalancesClient.create)
      .mockResolvedValue(response);

    const request = {
      assignmentId: "assignment-id",
      year: 2026,
      openingBalance: 20,
      accruedBalance: 0,
      carriedOverBalance: 3,
      adjustedBalance: 0,
    };

    const result = await hrisEmployeeTimeOffBalancesService.create(request);

    expect(hrisApiEmployeeTimeOffBalancesClient.create).toHaveBeenCalledWith(
      request
    );
    expect(result).toEqual(response);
  });

  it("delegates getById to client", async () => {
    jest
      .mocked(hrisApiEmployeeTimeOffBalancesClient.getById)
      .mockResolvedValue(balance as any);

    const result =
      await hrisEmployeeTimeOffBalancesService.getById("balance-id");

    expect(hrisApiEmployeeTimeOffBalancesClient.getById).toHaveBeenCalledWith(
      "balance-id"
    );
    expect(result).toEqual(balance);
  });

  it("delegates listByUserId to client", async () => {
    jest
      .mocked(hrisApiEmployeeTimeOffBalancesClient.listByUserId)
      .mockResolvedValue([balance] as any);

    const result =
      await hrisEmployeeTimeOffBalancesService.listByUserId("user-id");

    expect(
      hrisApiEmployeeTimeOffBalancesClient.listByUserId
    ).toHaveBeenCalledWith("user-id");
    expect(result).toEqual([balance]);
  });

  it("delegates adjust to client", async () => {
    const response = { id: "balance-id" };

    jest
      .mocked(hrisApiEmployeeTimeOffBalancesClient.adjust)
      .mockResolvedValue(response);

    const request = {
      adjustmentAmount: -2,
      reason: "Correction for unauthorized absence",
    };

    const result = await hrisEmployeeTimeOffBalancesService.adjust(
      "balance-id",
      request
    );

    expect(hrisApiEmployeeTimeOffBalancesClient.adjust).toHaveBeenCalledWith(
      "balance-id",
      request
    );
    expect(result).toEqual(response);
  });

  it("delegates listAdjustments to client", async () => {
    jest
      .mocked(hrisApiEmployeeTimeOffBalancesClient.listAdjustments)
      .mockResolvedValue([adjustment] as any);

    const result =
      await hrisEmployeeTimeOffBalancesService.listAdjustments("balance-id");

    expect(
      hrisApiEmployeeTimeOffBalancesClient.listAdjustments
    ).toHaveBeenCalledWith("balance-id");
    expect(result).toEqual([adjustment]);
  });
});