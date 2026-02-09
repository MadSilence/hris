import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type { DeleteLegalEntityActionInput } from "@/components/modules/settings/modules/legalEntity/actions/deleteLegalEntityAction";
import { deleteLegalEntityAction, } from "@/components/modules/settings/modules/legalEntity/actions/deleteLegalEntityAction";
import { useInvalidateLegalEntityQuery, } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";
import { useDeleteLegalEntityAction } from "./useDeleteLegalEntityAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/legalEntity/actions/deleteLegalEntityAction",
  () => ({
    deleteLegalEntityAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity"
);

describe("useDeleteLegalEntityAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls deleteLegalEntityAction and runs revalidation on success", async () => {
    const mockPayload: DeleteLegalEntityActionInput = { id: "entity-1" };

    const mockRevalidate = jest.fn();

    (useInvalidateLegalEntityQuery as jest.Mock).mockReturnValue(mockRevalidate);
    (deleteLegalEntityAction as jest.Mock).mockResolvedValue({ status: "SUCCESS" });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useDeleteLegalEntityAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(deleteLegalEntityAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(mockRevalidate).toHaveBeenCalled();
  });
});
