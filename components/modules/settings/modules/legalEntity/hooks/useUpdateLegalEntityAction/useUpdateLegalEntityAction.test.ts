import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type { UpdateLegalEntityActionInput } from "@/components/modules/settings/modules/legalEntity/actions/updateLegalEntityAction";
import { updateLegalEntityAction, } from "@/components/modules/settings/modules/legalEntity/actions/updateLegalEntityAction";
import { useInvalidateLegalEntityQuery, } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";
import { useUpdateLegalEntityAction } from "./useUpdateLegalEntityAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/legalEntity/actions/updateLegalEntityAction",
  () => ({
    updateLegalEntityAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity"
);

describe("useUpdateLegalEntityAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updateLegalEntityAction and runs revalidation on success", async () => {
    const mockPayload: UpdateLegalEntityActionInput = {
      id: "entity-1",
      name: "Name",
      description: "",
      registrationNumber: "123",
      taxId: "TAX",
      email: "",
      phone: "",
      country: "UK",
      city: "London",
      street: "Baker",
      building: "221B",
      postCode: "NW1",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateLegalEntityQuery as jest.Mock).mockReturnValue(mockRevalidate);
    (updateLegalEntityAction as jest.Mock).mockResolvedValue({ status: "SUCCESS" });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useUpdateLegalEntityAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(updateLegalEntityAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(mockRevalidate).toHaveBeenCalled();
  });
});
