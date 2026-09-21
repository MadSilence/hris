import type { CapturedReactQueryOptions } from "@/test/types";
import { renderHook } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { insertManagerAboveAction } from "@/components/modules/organization/orgChart/actions/insertManagerAboveAction";
import { ORG_CHART_QK } from "@/components/modules/organization/orgChart/hooks/useOrgChart/useOrgChart";
import { useInsertManagerAbove } from "@/components/modules/organization/orgChart/hooks/useInsertManagerAbove";
import { showActionError } from "@/lib/errors/errorToast";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/components/modules/organization/orgChart/actions/insertManagerAboveAction", () => ({
  insertManagerAboveAction: jest.fn(),
}));

jest.mock("@/components/modules/organization/orgChart/hooks/useOrgChart/useOrgChart", () => ({
  ORG_CHART_QK: "org-chart",
}));

jest.mock("@/lib/errors/errorToast", () => ({
  showActionError: jest.fn(),
}));

describe("useInsertManagerAbove", () => {
  let captured!: CapturedReactQueryOptions;
  const invalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });
    (useMutation as jest.Mock).mockImplementation((opts: CapturedReactQueryOptions) => {
      captured = opts;
      return { mutate: opts.mutationFn };
    });
  });

  it("sends one call for both reporting lines and refreshes the chart", async () => {
    (insertManagerAboveAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS });

    renderHook(() => useInsertManagerAbove());
    await captured.mutationFn({ userId: "target", managerId: "inserted" });

    expect(insertManagerAboveAction).toHaveBeenCalledTimes(1);
    expect(insertManagerAboveAction).toHaveBeenCalledWith("target", "inserted");
    expect(showActionError).not.toHaveBeenCalled();

    captured.onSuccess();
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [ORG_CHART_QK] });
  });

  it("shows a refusal as the refusal card and does not refresh", async () => {
    const refusal = {
      status: ActionStatus.ERROR,
      code: "U00005",
      errorMessage: "This would create a circular reporting line",
    };
    (insertManagerAboveAction as jest.Mock).mockResolvedValue(refusal);

    renderHook(() => useInsertManagerAbove());

    await expect(captured.mutationFn({ userId: "target", managerId: "report" })).rejects.toThrow(
      "This would create a circular reporting line",
    );
    expect(showActionError).toHaveBeenCalledWith(refusal);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
