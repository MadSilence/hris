import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type { DeleteOfficeActionInput } from "@/components/modules/settings/modules/office/actions/deleteOfficeAction";
import { deleteOfficeAction } from "@/components/modules/settings/modules/office/actions/deleteOfficeAction";
import { useInvalidateOfficeQuery } from "@/components/modules/settings/modules/office/hooks/useOffice";
import { useDeleteOfficeAction } from "./useDeleteOfficeAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/office/actions/deleteOfficeAction",
  () => ({
    deleteOfficeAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/office/hooks/useOffice",
  () => ({
    useInvalidateOfficeQuery: jest.fn(),
  })
);

describe("useDeleteOfficeAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls deleteOfficeAction and runs revalidation on success", async () => {
    const mockPayload: DeleteOfficeActionInput = { id: "office-1" };

    const mockRevalidate = jest.fn();

    (useInvalidateOfficeQuery as jest.Mock).mockReturnValue(mockRevalidate);
    (deleteOfficeAction as jest.Mock).mockResolvedValue({ status: "SUCCESS" });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useDeleteOfficeAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(deleteOfficeAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(mockRevalidate).toHaveBeenCalled();
  });
});
