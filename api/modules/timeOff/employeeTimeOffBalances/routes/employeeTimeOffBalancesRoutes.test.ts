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

import { employeeTimeOffBalancesRoutes } from "@/api/modules/timeOff/employeeTimeOffBalances/routes";
import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";
import {
  EmployeeTimeOffBalanceTransactionDTO,
  TimeOffBalanceTransactionType,
} from "@/api/modules/timeOff/employeeTimeOffBalances/dto";

jest.mock("@/api/modules/timeOff/employeeTimeOffBalances/services", () => ({
  hrisEmployeeTimeOffBalancesService: {
    getById: jest.fn(),
    listByUserId: jest.fn(),
    listTransactions: jest.fn(),
  },
}));

describe("EmployeeTimeOffBalancesRoutes", () => {
  const balance = {
    id: "balance-id",
    assignmentId: "assignment-id",
    policyId: "policy-id",
    userId: "user-id",
    periodStart: "2026-01-01",
    periodEnd: "2026-12-31",
    year: 2026,
    openingBalance: 20,
    accruedBalance: 0,
    usedBalance: 5,
    adjustedBalance: -2,
    carriedOverBalance: 3,
    currentBalance: 16,
    pendingBalance: 0,
    remainingCarryover: 0,
    createdAt: "2026-01-01T10:00:00",
    updatedAt: "2026-06-01T10:00:00",
  };

  const transaction: EmployeeTimeOffBalanceTransactionDTO = {
    id: "transaction-id",
    balanceId: "balance-id",
    type: TimeOffBalanceTransactionType.Adjustment,
    amount: -2,
    effectiveDate: "2026-06-01",
    reason: "Correction for unauthorized absence",
    sourceRef: null,
    policyVersionId: null,
    createdAt: "2026-06-01T10:00:00",
    createdBy: "admin-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets balance by id", async () => {
    jest
      .mocked(hrisEmployeeTimeOffBalancesService.getById)
      .mockResolvedValue(partialMock(balance));

    const res = await employeeTimeOffBalancesRoutes.getById(
      {} as Request,
      "balance-id"
    );
    const result = await res.json();

    expect(hrisEmployeeTimeOffBalancesService.getById).toHaveBeenCalledWith(
      "balance-id"
    );
    expect(result).toEqual(balance);
  });

  it("lists balances by user id", async () => {
    jest
      .mocked(hrisEmployeeTimeOffBalancesService.listByUserId)
      .mockResolvedValue(partialMock([balance]));

    const res = await employeeTimeOffBalancesRoutes.listByUserId(
      {} as Request,
      "user-id"
    );
    const result = await res.json();

    expect(
      hrisEmployeeTimeOffBalancesService.listByUserId
    ).toHaveBeenCalledWith("user-id");
    expect(result).toEqual([balance]);
  });

  it("lists transactions", async () => {
    jest
      .mocked(hrisEmployeeTimeOffBalancesService.listTransactions)
      .mockResolvedValue([transaction]);

    const res = await employeeTimeOffBalancesRoutes.listTransactions(
      {} as Request,
      "balance-id"
    );
    const result = await res.json();

    expect(
      hrisEmployeeTimeOffBalancesService.listTransactions
    ).toHaveBeenCalledWith("balance-id");
    expect(result).toEqual([transaction]);
  });
});